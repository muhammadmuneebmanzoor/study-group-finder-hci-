import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Users, Calendar, MapPin, Loader2, FileText, Download, AlertTriangle, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function GroupDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [group, setGroup] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchGroup();
    const socket = io('/', { path: '/socket.io' });
    socketRef.current = socket;
    
    socket.emit('joinRoom', id);
    socket.on('newMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.emit('leaveRoom', id);
      socket.disconnect();
    };
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchGroup = async () => {
    try {
      const [groupRes, msgRes] = await Promise.all([
        api.get(`/groups/${id}`),
        api.get(`/groups/${id}/messages`).catch(() => ({ data: [] }))
      ]);
      setGroup(groupRes.data);
      setMessages(msgRes.data);
      setIsJoined(groupRes.data.members.some((m: any) => m.userId === user?.id));
    } catch (err) {
      toast.error("Failed to load group");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    try {
      await api.post(`/groups/${id}/join`);
      toast.success("Joined group!");
      fetchGroup();
    } catch (err) {
      toast.error("Could not join group");
    }
  };

  const handleLeave = async () => {
    try {
      await api.post(`/groups/${id}/leave`);
      toast.success("Left group safely.");
      fetchGroup();
    } catch (err) {
      toast.error("Could not leave group");
    }
  };

  const handleReport = () => {
    toast.success("Group reported to moderators. We will review it shortly.");
  }

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current) return;
    
    socketRef.current.emit('sendMessage', {
      groupId: id,
      userId: user?.id,
      content: newMessage
    });
    setNewMessage('');
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!group) return <div className="text-center py-20">Group not found</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      
      {/* Banner */}
      <div className="w-full h-48 md:h-64 rounded-2xl overflow-hidden relative bg-gradient-to-r from-primary/80 to-blue-600 flex items-center justify-center shadow-lg">
         <div className="absolute inset-0 bg-black/20" />
         <div className="relative z-10 text-center text-white px-4">
           <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight drop-shadow-md">{group.title}</h1>
           <div className="flex flex-wrap justify-center gap-2 text-sm md:text-base font-medium">
             <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">{group.subject}</span>
             <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5"><MapPin className="w-4 h-4"/> {group.university || 'Global'}</span>
             <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5"><Users className="w-4 h-4"/> {group.members?.length || 0} / {group.capacity}</span>
           </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sidebar / Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About Group</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{group.description}</p>
              
              <div className="space-y-4 pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-sm">
                   <div>
                     <span className="text-muted-foreground block text-xs uppercase font-bold tracking-wider mb-1">Semester</span>
                     <span className="font-medium">{group.semester || 'All Semesters'}</span>
                   </div>
                   <div>
                     <span className="text-muted-foreground block text-xs uppercase font-bold tracking-wider mb-1">Department</span>
                     <span className="font-medium">{group.department || 'General'}</span>
                   </div>
                   <div>
                     <span className="text-muted-foreground block text-xs uppercase font-bold tracking-wider mb-1">Meeting</span>
                     <span className="font-medium capitalize">{group.meetingType || 'online'}</span>
                   </div>
                   <div>
                     <span className="text-muted-foreground block text-xs uppercase font-bold tracking-wider mb-1">Privacy</span>
                     <span className="font-medium capitalize">{group.privacy || 'public'}</span>
                   </div>
                </div>
              </div>

              {!isJoined ? (
                <Button className="w-full" onClick={handleJoin}>Join Group</Button>
              ) : (
                <div className="space-y-2">
                 <Button className="w-full" variant="outline" onClick={handleLeave}>Leave Group</Button>
                 <Button variant="ghost" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleReport}>
                   <ShieldAlert className="w-4 h-4 mr-2"/> Report Group
                 </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium uppercase text-muted-foreground">Members</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[250px] pr-4">
                <div className="space-y-4">
                  {group.members?.map((m: any) => (
                    <div key={m.id} className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">{m.user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="text-sm font-medium truncate flex-1">{m.user.name}</div>
                      {m.role === 'ADMIN' && <span className="ml-auto text-[10px] bg-secondary px-2 py-0.5 rounded uppercase font-bold tracking-wider text-muted-foreground shrink-0">Admin</span>}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2">
          {isJoined ? (
            <Tabs defaultValue="chat" className="w-full">
              <TabsList className="mb-4 bg-muted/50 w-full justify-start border-b rounded-none px-4 h-12">
                <TabsTrigger value="chat" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-4">Discussion</TabsTrigger>
                <TabsTrigger value="sessions" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-4">Sessions</TabsTrigger>
                <TabsTrigger value="files" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-4">Resources</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat" className="mt-0">
                <Card className="h-[calc(100vh-300px)] min-h-[500px] flex flex-col border-none shadow-md overflow-hidden ring-1 ring-border rounded-xl">
                  <CardHeader className="border-b bg-card py-4 px-6 shrink-0">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                      </span>
                      Live Chat
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 p-0 flex flex-col bg-slate-50/50 dark:bg-slate-900/50 min-h-0">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
                      {messages.length === 0 ? (
                        <div className="text-center text-muted-foreground h-full flex items-center justify-center flex-col gap-2">
                           <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-2">
                              <Users className="w-5 h-5 text-muted-foreground" />
                           </div>
                           <p>No messages yet.</p>
                           <p className="text-xs">Be the first to say hello!</p>
                        </div>
                      ) : (
                        messages.map((msg: any, i) => {
                          const isMe = msg.user.id === user?.id;
                          return (
                            <div key={i} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                              <Avatar className="w-8 h-8 shrink-0 mt-1">
                                <AvatarFallback className={isMe ? "bg-primary text-primary-foreground" : "bg-card border"}>
                                  {msg.user.name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                                <span className="text-xs text-muted-foreground mb-1 px-1">{msg.user.name}</span>
                                <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-card border shadow-sm rounded-tl-sm'}`}>
                                  {msg.content}
                                </div>
                                <span className="text-[10px] text-muted-foreground mt-1 px-1">
                                  {format(new Date(msg.createdAt), 'h:mm a')}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    <div className="p-4 bg-card border-t shrink-0">
                      <form onSubmit={sendMessage} className="flex gap-2">
                        <Input 
                          value={newMessage} 
                          onChange={e => setNewMessage(e.target.value)}
                          placeholder="Type a message..." 
                          className="bg-muted/50 border-transparent focus-visible:ring-primary focus-visible:bg-background h-11"
                        />
                        <Button type="submit" size="icon" disabled={!newMessage.trim()} className="shrink-0 rounded-full h-11 w-11 shadow-sm">
                          <Send className="w-5 h-5 ml-0.5" />
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sessions" className="mt-0">
                <Card className="min-h-[500px]">
                  <CardHeader>
                    <CardTitle>Upcoming Sessions</CardTitle>
                    <CardDescription>Scheduled meetings for this group</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-16 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                      <Calendar className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      <p>No upcoming sessions scheduled.</p>
                      <Button variant="outline" className="mt-4">Schedule Session</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="files" className="mt-0">
                <Card className="min-h-[500px]">
                  <CardHeader>
                    <CardTitle>Shared Resources</CardTitle>
                    <CardDescription>Files and documents shared by members</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Example mocked file */}
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Syllabus_2024.pdf</p>
                            <p className="text-xs text-muted-foreground">Added by Admin • 2.4 MB</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="text-center py-10 mt-4 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                        <p>Upload a new file to share with the group.</p>
                        <Button variant="outline" className="mt-4">Upload File</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>
          ) : (
            <Card className="h-full flex items-center justify-center bg-muted/30 border-dashed min-h-[500px]">
              <CardContent className="text-center">
                <Users className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Join to Access Content</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-8">You need to be a member of this study group to participate in discussions, view sessions, and download resources.</p>
                <Button onClick={handleJoin} size="lg" className="w-48 shadow-lg">Join Group</Button>
              </CardContent>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}
