import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { api } from '../lib/api';

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    university: user?.university || '',
    department: user?.department || '',
    semester: user?.semester || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        university: user.university || '',
        department: user.department || '',
        semester: user.semester || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      const res = await api.put('/auth/profile', formData);
      setUser(res.data.user);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update profile");
    }
  };

  const handlePasswordUpdate = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    // mock password update
    toast.success("Password updated successfully");
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Avatar className="w-16 h-16 border-2 border-border">
          <AvatarFallback className="text-xl bg-primary/10 text-primary">
            {user?.name?.[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{user?.name}</h1>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>
      </div>
      
      <Tabs defaultValue="profile" className="flex flex-col md:flex-row gap-8">
        <TabsList className="flex flex-col h-auto bg-transparent items-start w-full md:w-64 gap-1 p-0 shrink-0">
          <TabsTrigger value="profile" className="w-full justify-start data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4 py-2.5 rounded-lg">Profile Details</TabsTrigger>
          <TabsTrigger value="academic" className="w-full justify-start data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4 py-2.5 rounded-lg">Academic Info</TabsTrigger>
          <TabsTrigger value="security" className="w-full justify-start data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4 py-2.5 rounded-lg">Security Settings</TabsTrigger>
        </TabsList>
        
        <div className="flex-1 w-full min-w-0">
          <TabsContent value="profile" className="mt-0 outline-none">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Public Profile</CardTitle>
                <CardDescription>Manage your personal information and bio.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea 
                      placeholder="Write a short summary about yourself"
                      value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-2">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSave}>Save Changes</Button>
                      <Button variant="ghost" onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: user?.name || '',
                          bio: user?.bio || '',
                          university: user?.university || '',
                          department: user?.department || '',
                          semester: user?.semester || ''
                        });
                      }}>Cancel</Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="academic" className="mt-0 outline-none">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Academic Information</CardTitle>
                <CardDescription>Update your university, department, and semester.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label>University</Label>
                    <Input placeholder="e.g. Stanford University" value={formData.university} onChange={e => setFormData({...formData, university: e.target.value})} disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input placeholder="e.g. Computer Science" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Semester</Label>
                    <Input placeholder="e.g. Spring 2024" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} disabled={!isEditing} />
                  </div>
                </div>
                <div className="pt-4 flex gap-2">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSave}>Save Changes</Button>
                      <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>Edit Academic Info</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-0 outline-none">
             <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Update your password and secure your account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input type="password" value={passwordData.currentPassword} onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input type="password" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} />
                  </div>
                  <Button onClick={handlePasswordUpdate}>Update Password</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
