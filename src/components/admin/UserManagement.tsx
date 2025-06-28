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
  FileSpreadsheet
} from 'lucide-react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { User, Brigade } from '@/types';

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

  const [bulkUploadData, setBulkUploadData] = useState('');

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
    if (!bulkUploadData.trim()) {
      setError('Please enter CSV data');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const lines = bulkUploadData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const userData: any = {};
        
        headers.forEach((header, index) => {
          userData[header] = values[index];
        });

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
        }
      }
      
      setBulkUploadData('');
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

  const generateCSVTemplate = () => {
    const template = `name,rollNumber,brigadeName,password
John Doe,CS2021001,Alpha Brigade,student123
Jane Smith,CS2021002,Beta Brigade,student123`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <div className="flex items-center space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Bulk Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Bulk Upload Users</DialogTitle>
                <DialogDescription>
                  Upload multiple students using CSV format
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={generateCSVTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                  <span className="text-sm text-gray-600">Download CSV template to get started</span>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="csvData">CSV Data</Label>
                  <Textarea
                    id="csvData"
                    value={bulkUploadData}
                    onChange={(e) => setBulkUploadData(e.target.value)}
                    placeholder="Paste your CSV data here..."
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>
                <Button onClick={handleBulkUpload} disabled={loading} className="w-full">
                  {loading ? 'Uploading...' : 'Upload Users'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
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
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Creating...' : 'Create User'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedRole} onValueChange={(value: 'ALL' | 'ADMIN' | 'STUDENT') => setSelectedRole(value)}>
              <SelectTrigger className="w-40">
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
          <Card className="p-8 text-center">
            <CardContent>
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
              <p className="text-gray-600">No users match your current filters.</p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${user.role === 'ADMIN' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                        {user.role === 'ADMIN' ? 
                          <Shield className={`h-4 w-4 ${user.role === 'ADMIN' ? 'text-purple-600' : 'text-blue-600'}`} /> :
                          <GraduationCap className="h-4 w-4 text-blue-600" />
                        }
                      </div>
                      <div>
                        <CardTitle className="text-lg">{user.name}</CardTitle>
                        <CardDescription>
                          {user.role === 'ADMIN' ? user.email : `${user.rollNumber} • ${user.brigadeName}`}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                      <Badge variant={user.isActive ? 'default' : 'destructive'}>
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
                    >
                      {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.role === 'STUDENT').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.role === 'ADMIN').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.isActive).length}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};