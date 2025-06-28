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
  CheckCircle,
  AlertCircle,
  Filter,
  MoreVertical
} from 'lucide-react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { User, Brigade } from '@/types';
import { generateStudentTemplate, generateAdminTemplate, parseStudentExcel, parseAdminExcel } from '@/lib/excelTemplates';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [brigades, setBrigades] = useState<Brigade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<'ALL' | 'ADMIN' | 'STUDENT'>('ALL');

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    rollNumber: '',
    role: 'STUDENT' as 'ADMIN' | 'STUDENT',
    brigadeId: '',
    password: ''
  });

  const [bulkUploadFile, setBulkUploadFile] = useState<File | null>(null);

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
      
      setUserForm({
        name: '',
        email: '',
        rollNumber: '',
        role: 'STUDENT',
        brigadeId: '',
        password: ''
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
    if (!bulkUploadFile) {
      setError('Please upload a file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let usersToCreate: any[] = [];

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
          } catch (error) {
            console.error(`Error creating admin ${userData.email}:`, error);
          }
        }
      }
      
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage admin and student accounts efficiently</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50 rounded-lg">
                <Upload className="h-4 w-4 mr-2" />
                Bulk Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5 text-purple-600" />
                  <span>Bulk Upload Users</span>
                </DialogTitle>
                <DialogDescription>
                  Upload multiple users using Excel files
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={generateStudentTemplate}
                    className="h-20 flex-col space-y-2 border-emerald-200 hover:bg-emerald-50 rounded-xl"
                  >
                    <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
                    <span>Download Student Template</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={generateAdminTemplate}
                    className="h-20 flex-col space-y-2 border-blue-200 hover:bg-blue-50 rounded-xl"
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
                    className="border-2 border-dashed border-gray-300 hover:border-purple-400 rounded-lg"
                  />
                </div>
                
                <Button onClick={handleBulkUpload} disabled={loading || !bulkUploadFile} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg">
                  {loading ? 'Uploading...' : 'Upload Users'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg">
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5 text-purple-600" />
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
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userRole">Role</Label>
                  <Select value={userForm.role} onValueChange={(value: 'ADMIN' | 'STUDENT') => 
                    setUserForm(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger className="rounded-lg">
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
                      className="rounded-lg"
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
                        className="rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userBrigade">Brigade</Label>
                      <Select value={userForm.brigadeId} onValueChange={(value) => 
                        setUserForm(prev => ({ ...prev, brigadeId: value }))}>
                        <SelectTrigger className="rounded-lg">
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
                    className="rounded-lg"
                  />
                </div>
                
                <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg">
                  {loading ? 'Creating...' : 'Create User'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Filter className="h-5 w-5 text-purple-600" />
            <span>Filters & Search</span>
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
                  className="pl-10 rounded-lg"
                />
              </div>
            </div>
            <Select value={selectedRole} onValueChange={(value: 'ALL' | 'ADMIN' | 'STUDENT') => setSelectedRole(value)}>
              <SelectTrigger className="w-full sm:w-40 rounded-lg">
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
          <Card className="p-8 text-center border-0 shadow-lg">
            <CardContent>
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
              <p className="text-gray-600">No users match your current filters.</p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl ${user.role === 'ADMIN' ? 'bg-purple-50' : 'bg-blue-50'}`}>
                        {user.role === 'ADMIN' ? 
                          <Shield className="h-6 w-6 text-purple-600" /> :
                          <GraduationCap className="h-6 w-6 text-blue-600" />
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
                        className={`${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-blue-100 text-blue-800 border-blue-200'}`}
                      >
                        {user.role}
                      </Badge>
                      <Badge 
                        variant={user.isActive ? 'default' : 'destructive'} 
                        className={user.isActive ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : ''}
                      >
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
                      className="rounded-lg"
                    >
                      {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg"
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
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{users.length}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-emerald-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">{users.filter(u => u.role === 'STUDENT').length}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{users.filter(u => u.role === 'ADMIN').length}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-50 to-orange-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{users.filter(u => u.isActive).length}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};