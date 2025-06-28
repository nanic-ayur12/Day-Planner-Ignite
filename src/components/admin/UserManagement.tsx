import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, 
  Plus, 
  Upload, 
  Download, 
  Edit, 
  Trash2, 
  Search,
  UserCheck,
  UserX,
  Shield,
  GraduationCap,
  FileSpreadsheet,
  Mail,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { User, Brigade } from '@/types';
import { sendWelcomeEmail, sendBulkWelcomeEmails } from '@/lib/emailService';
import { generateStudentTemplate, generateAdminTemplate, parseStudentExcel, parseAdminExcel } from '@/lib/excelTemplates';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [brigades, setBrigades] = useState<Brigade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<'ALL' | 'ADMIN' | 'STUDENT'>('ALL');
  const [emailStatus, setEmailStatus] = useState<{ success: number; failed: number } | null>(null);

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    rollNumber: '',
    role: 'STUDENT' as 'ADMIN' | 'STUDENT',
    brigadeId: '',
    password: '',
    sendWelcomeEmail: true
  });

  const [bulkUploadData, setBulkUploadData] = useState('');
  const [bulkUploadFile, setBulkUploadFile] = useState<File | null>(null);
  const [sendBulkEmails, setSendBulkEmails] = useState(true);

  useEffect(() => {
    fetchUsers();
    fetchBrigades();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as User[];
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    }
  };

  const fetchBrigades = async () => {
    try {
      const brigadesSnapshot = await getDocs(collection(db, 'brigades'));
      const brigadesData = brigadesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as Brigade[];
      setBrigades(brigadesData);
    } catch (error) {
      console.error('Error fetching brigades:', error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name || !userForm.password || 
        (userForm.role === 'ADMIN' && !userForm.email) ||
        (userForm.role === 'STUDENT' && (!userForm.rollNumber || !userForm.brigadeId))) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const email = userForm.role === 'ADMIN' 
        ? userForm.email 
        : `${userForm.rollNumber}@student.ignite.edu`;

      const userCredential = await createUserWithEmailAndPassword(auth, email, userForm.password);
      
      const selectedBrigade = brigades.find(b => b.id === userForm.brigadeId);
      
      const userData: Omit<User, 'id'> = {
        name: userForm.name,
        role: userForm.role,
        createdAt: new Date(),
        isActive: true,
        ...(userForm.role === 'ADMIN' ? { email: userForm.email } : {
          email: email,
          rollNumber: userForm.rollNumber,
          brigadeId: userForm.brigadeId,
          brigadeName: selectedBrigade?.name
        })
      };

      await addDoc(collection(db, 'users'), { ...userData, id: userCredential.user.uid });
      
      // Send welcome email if requested
      if (userForm.sendWelcomeEmail) {
        const emailData = {
          name: userForm.name,
          email: email,
          role: userForm.role,
          rollNumber: userForm.role === 'STUDENT' ? userForm.rollNumber : undefined,
          brigadeName: selectedBrigade?.name,
          password: userForm.password
        };
        
        const emailSent = await sendWelcomeEmail(emailData);
        if (emailSent) {
          setEmailStatus({ success: 1, failed: 0 });
        } else {
          setEmailStatus({ success: 0, failed: 1 });
        }
      }
      
      setUserForm({
        name: '',
        email: '',
        rollNumber: '',
        role: 'STUDENT',
        brigadeId: '',
        password: '',
        sendWelcomeEmail: true
      });
      
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkUploadFile && !bulkUploadData.trim()) {
      setError('Please upload a file or enter CSV data');
      return;
    }

    setLoading(true);
    setError('');
    setEmailStatus(null);

    try {
      let usersToCreate: any[] = [];

      if (bulkUploadFile) {
        // Handle Excel file upload
        if (bulkUploadFile.name.endsWith('.xlsx') || bulkUploadFile.name.endsWith('.xls')) {
          if (userForm.role === 'STUDENT') {
            usersToCreate = await parseStudentExcel(bulkUploadFile);
          } else {
            usersToCreate = await parseAdminExcel(bulkUploadFile);
          }
        } else {
          setError('Please upload a valid Excel file (.xlsx or .xls)');
          return;
        }
      } else {
        // Handle CSV data
        const lines = bulkUploadData.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const userData: any = {};
          
          headers.forEach((header, index) => {
            userData[header] = values[index];
          });
          
          usersToCreate.push(userData);
        }
      }

      const emailsToSend: any[] = [];

      for (const userData of usersToCreate) {
        if (userData.role === 'STUDENT' && userData.rollNumber) {
          const email = `${userData.rollNumber}@student.ignite.edu`;
          const password = userData.password || 'student123';
          
          try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const selectedBrigade = brigades.find(b => b.name === userData.brigadeName);
            
            const userDoc = {
              id: userCredential.user.uid,
              name: userData.name,
              email: email,
              rollNumber: userData.rollNumber,
              role: 'STUDENT',
              brigadeId: selectedBrigade?.id,
              brigadeName: userData.brigadeName,
              createdAt: new Date(),
              isActive: true
            };
            
            await addDoc(collection(db, 'users'), userDoc);

            if (sendBulkEmails) {
              emailsToSend.push({
                name: userData.name,
                email: email,
                role: 'STUDENT',
                rollNumber: userData.rollNumber,
                brigadeName: userData.brigadeName,
                password: password
              });
            }
          } catch (error) {
            console.error(`Error creating user ${userData.rollNumber}:`, error);
          }
        } else if (userData.role === 'ADMIN' && userData.email) {
          const password = userData.password || 'admin123';
          
          try {
            const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
            
            const userDoc = {
              id: userCredential.user.uid,
              name: userData.name,
              email: userData.email,
              role: 'ADMIN',
              createdAt: new Date(),
              isActive: true
            };
            
            await addDoc(collection(db, 'users'), userDoc);

            if (sendBulkEmails) {
              emailsToSend.push({
                name: userData.name,
                email: userData.email,
                role: 'ADMIN',
                password: password
              });
            }
          } catch (error) {
            console.error(`Error creating admin ${userData.email}:`, error);
          }
        }
      }

      // Send bulk emails if requested
      if (sendBulkEmails && emailsToSend.length > 0) {
        const emailResult = await sendBulkWelcomeEmails(emailsToSend);
        setEmailStatus(emailResult);
      }
      
      setBulkUploadData('');
      setBulkUploadFile(null);
      fetchUsers();
    } catch (error) {
      console.error('Error bulk uploading users:', error);
      setError('Failed to bulk upload users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', userId));
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user');
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), { isActive: !currentStatus });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      setError('Failed to update user status');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'ALL' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage admin and student accounts</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                <Upload className="h-4 w-4 mr-2" />
                Bulk Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5 text-indigo-600" />
                  <span>Bulk Upload Users</span>
                </DialogTitle>
                <DialogDescription>
                  Upload multiple users using Excel files or CSV format
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="excel" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="excel">Excel Upload</TabsTrigger>
                  <TabsTrigger value="csv">CSV Data</TabsTrigger>
                </TabsList>
                
                <TabsContent value="excel" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      onClick={generateStudentTemplate}
                      className="h-20 flex-col space-y-2 border-green-200 hover:bg-green-50"
                    >
                      <FileSpreadsheet className="h-6 w-6 text-green-600" />
                      <span>Download Student Template</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={generateAdminTemplate}
                      className="h-20 flex-col space-y-2 border-blue-200 hover:bg-blue-50"
                    >
                      <FileSpreadsheet className="h-6 w-6 text-blue-600" />
                      <span>Download Admin Template</span>
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="excelFile">Upload Excel File</Label>
                    <Input
                      id="excelFile"
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => setBulkUploadFile(e.target.files?.[0] || null)}
                      className="border-2 border-dashed border-gray-300 hover:border-indigo-400"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sendBulkEmails" 
                      checked={sendBulkEmails}
                      onCheckedChange={(checked) => setSendBulkEmails(checked as boolean)}
                    />
                    <Label htmlFor="sendBulkEmails" className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Send welcome emails to all users</span>
                    </Label>
                  </div>
                  
                  <Button onClick={handleBulkUpload} disabled={loading || !bulkUploadFile} className="w-full bg-indigo-600 hover:bg-indigo-700">
                    {loading ? 'Uploading...' : 'Upload Users'}
                  </Button>
                </TabsContent>
                
                <TabsContent value="csv" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="csvData">CSV Data</Label>
                    <Textarea
                      id="csvData"
                      value={bulkUploadData}
                      onChange={(e) => setBulkUploadData(e.target.value)}
                      placeholder="name,rollNumber,brigadeName,password&#10;John Doe,CS2021001,Alpha Brigade,student123&#10;Jane Smith,CS2021002,Beta Brigade,student123"
                      rows={10}
                      className="font-mono text-sm"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sendBulkEmailsCSV" 
                      checked={sendBulkEmails}
                      onCheckedChange={(checked) => setSendBulkEmails(checked as boolean)}
                    />
                    <Label htmlFor="sendBulkEmailsCSV" className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Send welcome emails to all users</span>
                    </Label>
                  </div>
                  
                  <Button onClick={handleBulkUpload} disabled={loading || !bulkUploadData.trim()} className="w-full bg-indigo-600 hover:bg-indigo-700">
                    {loading ? 'Uploading...' : 'Upload Users'}
                  </Button>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5 text-indigo-600" />
                  <span>Add New User</span>
                </DialogTitle>
                <DialogDescription>
                  Create a new admin or student account
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userName">Name</Label>
                  <Input
                    id="userName"
                    value={userForm.name}
                    onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                    className="border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userRole">Role</Label>
                  <Select value={userForm.role} onValueChange={(value: 'ADMIN' | 'STUDENT') => 
                    setUserForm(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STUDENT">Student</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {userForm.role === 'ADMIN' ? (
                  <div className="space-y-2">
                    <Label htmlFor="userEmail">Email</Label>
                    <Input
                      id="userEmail"
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address"
                      className="border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="userRollNumber">Roll Number</Label>
                      <Input
                        id="userRollNumber"
                        value={userForm.rollNumber}
                        onChange={(e) => setUserForm(prev => ({ ...prev, rollNumber: e.target.value }))}
                        placeholder="Enter roll number"
                        className="border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userBrigade">Brigade</Label>
                      <Select value={userForm.brigadeId} onValueChange={(value) => 
                        setUserForm(prev => ({ ...prev, brigadeId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select brigade" />
                        </SelectTrigger>
                        <SelectContent>
                          {brigades.map(brigade => (
                            <SelectItem key={brigade.id} value={brigade.id}>
                              {brigade.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label htmlFor="userPassword">Password</Label>
                  <Input
                    id="userPassword"
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
                    className="border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="sendWelcomeEmail" 
                    checked={userForm.sendWelcomeEmail}
                    onCheckedChange={(checked) => setUserForm(prev => ({ ...prev, sendWelcomeEmail: checked as boolean }))}
                  />
                  <Label htmlFor="sendWelcomeEmail" className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Send welcome email</span>
                  </Label>
                </div>
                
                <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">
                  {loading ? 'Creating...' : 'Create User'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {emailStatus && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-green-800">
            Email Status: {emailStatus.success} sent successfully, {emailStatus.failed} failed
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Search className="h-5 w-5 text-indigo-600" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
            <Select value={selectedRole} onValueChange={(value: 'ALL' | 'ADMIN' | 'STUDENT') => setSelectedRole(value)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="ADMIN">Admins</SelectItem>
                <SelectItem value="STUDENT">Students</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid gap-4">
        {filteredUsers.length === 0 ? (
          <Card className="p-8 text-center border border-gray-200">
            <CardContent>
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
              <p className="text-gray-600">No users match your current filters.</p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow border border-gray-200">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-xl ${user.role === 'ADMIN' ? 'bg-purple-50' : 'bg-blue-50'}`}>
                        {user.role === 'ADMIN' ? 
                          <Shield className={`h-5 w-5 ${user.role === 'ADMIN' ? 'text-purple-600' : 'text-blue-600'}`} /> :
                          <GraduationCap className="h-5 w-5 text-blue-600" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{user.name}</CardTitle>
                        <CardDescription className="truncate">
                          {user.role === 'ADMIN' ? user.email : `${user.rollNumber} • ${user.brigadeName}`}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge 
                        variant={user.role === 'ADMIN' ? 'default' : 'secondary'}
                        className={user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}
                      >
                        {user.role}
                      </Badge>
                      <Badge variant={user.isActive ? 'default' : 'destructive'} className={user.isActive ? 'bg-green-100 text-green-800' : ''}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Created: {user.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleUserStatus(user.id, user.isActive)}
                      className="border-gray-200 hover:bg-gray-50"
                    >
                      {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{users.filter(u => u.role === 'STUDENT').length}</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{users.filter(u => u.role === 'ADMIN').length}</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{users.filter(u => u.isActive).length}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};