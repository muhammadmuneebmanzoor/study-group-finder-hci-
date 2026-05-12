import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, MessageSquare, Search } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { format } from 'date-fns';

export default function Messages() {
  const { user } = useAuthStore();
  const [groups, setGroups] = useState<any[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMyGroups();
    
    const socket = io('/', { path: '/socket.io' });
    socketRef.current = socket;
    
    socket.on('newMessage', (msg: any) => {
      setMessages(prev => [...prev, msg]);
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchMyGroups = async () => {
    try {
      const res = await api.get('/groups?filter=my-groups');
      setGroups(res.data);
      if (res.data.length > 0) {
        setActiveGroupId(res.data[0].id);
      }
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeGroupId && socketRef.current) {
      // Leave previous rooms
      groups.forEach(g => socketRef.current?.emit('leaveRoom', g.id));
      
      // Join new room
      socketRef.current.emit('joinRoom', activeGroupId);
      
      // Fetch history
      api.get(`/groups/${activeGroupId}/messages`).then(res => {
         setMessages(res.data);
         setTimeout(() => {
            if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
         }, 100);
      });
    }
  }, [activeGroupId, groups]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current || !activeGroupId) return;
    
    socketRef.current.emit('sendMessage', {
      groupId: activeGroupId,
      userId: user?.id,
      content: newMessage
    });
    setNewMessage('');
  };

  if (isLoading) {
    return <div className="text-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div>;
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] flex bg-card rounded-2xl border shadow-sm overflow-hidden ring-1 ring-border">
      
      {/* Sidebar: Group List */}
      <div className="w-80 border-r flex flex-col bg-muted/10 shrink-0 hidden md:flex">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold tracking-tight mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search chats..." className="pl-9 h-10 bg-background" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {groups.length === 0 ? (
             <div className="text-center p-4 text-muted-foreground text-sm">No groups joined yet.</div>
          ) : (
            groups.map(group => (
              <button 
                key={group.id} 
                onClick={() => setActiveGroupId(group.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${activeGroupId === group.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'}`}
              >
                <Avatar className="w-10 h-10 border shadow-sm bg-background">
                  <AvatarFallback className="bg-primary/5">{group.title[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{group.title}</h4>
                  <p className="text-xs text-muted-foreground truncate">{group.subject}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-900/50 min-w-0">
        {!activeGroupId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
            <MessageSquare className="w-16 h-16 opacity-30 mb-4" />
            <p className="text-lg font-medium">Select a group to start chatting</p>
          </div>
        ) : (
          <>
            <div className="h-16 border-b bg-card flex items-center px-6 shrink-0 shadow-sm z-10">
               <h3 className="font-bold text-lg">{groups.find(g => g.id === activeGroupId)?.title}</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Say hi to the group!</div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.user.id === user?.id;
                  return (
                    <div key={i} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                      <Avatar className="w-8 h-8 shrink-0 mt-1 shadow-sm">
                        <AvatarFallback className={isMe ? "bg-primary text-primary-foreground" : "bg-card border"}>
                          {msg.user.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                        <span className="text-[11px] text-muted-foreground/80 mb-1 px-1 font-medium">{msg.user.name}</span>
                        <div className={`px-4 py-2.5 rounded-2xl text-[15px] shadow-sm leading-relaxed ${isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-card border rounded-tl-sm'}`}>
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-muted-foreground/60 mt-1.5 px-1 font-medium">
                          {format(new Date(msg.createdAt), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="p-4 bg-card border-t shrink-0">
              <form onSubmit={sendMessage} className="flex gap-3">
                <Input 
                  value={newMessage} 
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type your message..." 
                  className="bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary h-12 rounded-xl px-4"
                />
                <Button type="submit" disabled={!newMessage.trim()} className="shrink-0 rounded-xl h-12 w-12 shadow-sm">
                  <Send className="w-5 h-5 ml-0.5" />
                </Button>
              </form>
            </div>
          </>
        )}
      </div>

    </div>
  )
}
