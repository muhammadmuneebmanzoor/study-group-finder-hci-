import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Calendar, Clock, Video, Users, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function Scheduler() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    groupId: '',
    title: '',
    startTime: '',
    endTime: '',
    meetingLink: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [sessionsRes, groupsRes] = await Promise.all([
        api.get('/sessions'),
        api.get('/groups?filter=my-groups')
      ]);
      setSessions(sessionsRes.data);
      setMyGroups(groupsRes.data);
    } catch (err) {
      toast.error('Failed to load schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSession = async () => {
    try {
      if (!formData.groupId || !formData.title || !formData.startTime || !formData.endTime) {
        toast.error('Please fill in required fields');
        return;
      }
      await api.post('/sessions', formData);
      toast.success('Session scheduled successfully');
      setFormData({ groupId: '', title: '', startTime: '', endTime: '', meetingLink: '' });
      setIsDialogOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to schedule session');
    }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      await api.delete(`/sessions/${id}`);
      setSessions(sessions.filter(s => s.id !== id));
      toast.success('Session deleted successfully');
    } catch (err) {
      toast.error('Failed to delete session');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Scheduler</h1>
          <p className="text-muted-foreground">Manage and schedule meetings for your groups.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger
            render={
              <Button className="gap-2"><Plus className="w-4 h-4"/> Schedule Session</Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule a Meeting</DialogTitle>
              <DialogDescription>Create a new session for your study group.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Study Group</Label>
                <Select value={formData.groupId} onValueChange={(val) => setFormData({...formData, groupId: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                  <SelectContent>
                    {myGroups.map((g) => (
                      <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Session Title</Label>
                <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Midterm Prep" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input type="datetime-local" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input type="datetime-local" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Meeting Link / Location (Optional)</Label>
                <Input value={formData.meetingLink} onChange={e => setFormData({...formData, meetingLink: e.target.value})} placeholder="e.g. Zoom link or Room 402" />
              </div>
              <Button className="w-full mt-4" onClick={handleCreateSession}>Schedule Session</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div>
      ) : sessions.length === 0 ? (
        <Card className="border-dashed shadow-none bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-medium mb-2">No upcoming sessions</h3>
            <p className="text-muted-foreground max-w-sm mb-6">You don't have any sessions scheduled. Create one to get started.</p>
            <Button onClick={() => setIsDialogOpen(true)} variant="outline">Schedule Session</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map(session => (
            <Card key={session.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 border-b bg-muted/10">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{session.title}</CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteSession(session.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <CardDescription className="flex items-center gap-1.5 mt-1 font-medium text-primary">
                  <Users className="w-3.5 h-3.5" /> {session.group?.title}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center text-sm text-foreground">
                  <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                  {format(new Date(session.startTime), 'MMM d, h:mm a')} - {format(new Date(session.endTime), 'h:mm a')}
                </div>
                {session.meetingLink && (
                  <div className="flex items-center text-sm text-foreground">
                    <Video className="w-4 h-4 mr-2 text-muted-foreground" />
                    <a href={session.meetingLink.startsWith('http') ? session.meetingLink : `https://${session.meetingLink}`} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">
                      {session.meetingLink}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
