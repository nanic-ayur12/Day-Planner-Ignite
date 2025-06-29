import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Brigade, User } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const BrigadeManagement: React.FC = () => {
  const [brigades, setBrigades] = useState<Brigade[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingBrigade, setEditingBrigade] = useState<Brigade | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const [brigadeForm, setBrigadeForm] = useState({
    name: ''
  });

  const [editForm, setEditForm] = useState({
    name: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [brigadesSnapshot, usersSnapshot] = await Promise.all([
        getDocs(collection(db, 'brigades')),
        getDocs(collection(db, 'users'))
      ]);

      const brigadesData = brigadesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as Brigade[];

      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as User[];

      setBrigades(brigadesData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch brigade data');
      toast({
        title: "Error",
        description: "Failed to fetch brigade data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBrigade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brigadeForm.name.trim()) {
      setError('Please enter a brigade name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const brigadeData = {
        name: brigadeForm.name.trim(),
        createdAt: new Date(),
        isActive: true
      };

      await addDoc(collection(db, 'brigades'), brigadeData);
      setBrigadeForm({ name: '' });
      setIsCreateDialogOpen(false);
      fetchData();
      
      toast({
        title: "Success!",
        description: "Brigade created successfully",
      });
    } catch (error) {
      console.error('Error creating brigade:', error);
      setError('Failed to create brigade');
      toast({
        title: "Error",
        description: "Failed to create brigade",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditBrigade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrigade || !editForm.name.trim()) {
      setError('Please enter a brigade name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await updateDoc(doc(db, 'brigades', editingBrigade.id), {
        name: editForm.name.trim()
      });
      
      setEditingBrigade(null);
      setEditForm({ name: '' });
      setIsEditDialogOpen(false);
      fetchData();
      
      toast({
        title: "Success!",
        description: "Brigade updated successfully",
      });
    } catch (error) {
      console.error('Error updating brigade:', error);
      setError('Failed to update brigade');
      toast({
        title: "Error",
        description: "Failed to update brigade",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBrigade = async (brigadeId: string) => {
    const brigadeStudents = users.filter(u => u.brigadeId === brigadeId);
    
    if (brigadeStudents.length > 0) {
      toast({
        title: "Cannot Delete",
        description: `This brigade has ${brigadeStudents.length} students assigned. Please reassign them first.`,
        variant: "destructive",
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this brigade?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'brigades', brigadeId));
      fetchData();
      
      toast({
        title: "Success!",
        description: "Brigade deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting brigade:', error);
      toast({
        title: "Error",
        description: "Failed to delete brigade",
        variant: "destructive",
      });
    }
  };

  const startEditBrigade = (brigade: Brigade) => {
    setEditingBrigade(brigade);
    setEditForm({ name: brigade.name });
    setIsEditDialogOpen(true);
  };

  const getBrigadeStats = (brigadeId: string) => {
    const brigadeStudents = users.filter(u => u.brigadeId === brigadeId && u.role === 'STUDENT');
    const activeStudents = brigadeStudents.filter(u => u.isActive);
    
    return {
      totalStudents: brigadeStudents.length,
      activeStudents: activeStudents.length
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-black">Brigade Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Brigade
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Create New Brigade</DialogTitle>
              <DialogDescription>
                Create a new brigade to organize students
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateBrigade} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brigadeName">Brigade Name</Label>
                <Input
                  id="brigadeName"
                  value={brigadeForm.name}
                  onChange={(e) => setBrigadeForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter brigade name"
                />
              </div>
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Creating...' : 'Create Brigade'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Brigades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{brigades.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Brigades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {brigades.filter(b => b.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.role === 'STUDENT').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Brigades List */}
      <div className="grid gap-4">
        {loading ? (
          <Card className="p-8 text-center">
            <CardContent>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading brigades...</p>
            </CardContent>
          </Card>
        ) : brigades.length === 0 ? (
          <Card className="p-8 text-center">
            <CardContent>
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">No Brigades Found</h3>
              <p className="text-gray-600">Create your first brigade to get started.</p>
            </CardContent>
          </Card>
        ) : (
          brigades.map((brigade) => {
            const stats = getBrigadeStats(brigade.id);
            return (
              <Card key={brigade.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Shield className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-black">{brigade.name}</CardTitle>
                          <CardDescription>
                            Created on {brigade.createdAt.toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">
                            {stats.totalStudents} students ({stats.activeStudents} active)
                          </span>
                        </div>
                        <Badge variant={brigade.isActive ? 'default' : 'secondary'}>
                          {brigade.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditBrigade(brigade)}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteBrigade(brigade.id)}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })
        )}
      </div>

      {/* Edit Brigade Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Edit Brigade</DialogTitle>
            <DialogDescription>
              Update the brigade information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditBrigade} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editBrigadeName">Brigade Name</Label>
              <Input
                id="editBrigadeName"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter brigade name"
              />
            </div>
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex space-x-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Updating...' : 'Update Brigade'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};