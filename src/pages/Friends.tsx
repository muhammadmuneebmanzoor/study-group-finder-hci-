import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Copy, Users, Link as LinkIcon, Share2, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function Friends() {
  const { user } = useAuthStore();
  const [friends, setFriends] = useState<any[]>([]);
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFriends();
    generateLink();
  }, []);

  const fetchFriends = async () => {
    try {
      const res = await api.get('/friends');
      setFriends(res.data);
    } catch(err) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const generateLink = async () => {
    try {
      const res = await api.post('/friends/invite');
      setInviteLink(res.data.link);
    } catch(err) {
      // ignore
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success("Invite link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Friends & Network</h1>
        <p className="text-muted-foreground">Connect with students from your university and beyond.</p>
      </div>

      <Card className="border-none shadow-md bg-gradient-to-br from-primary/10 via-background to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Share2 className="w-5 h-5 text-primary" /> Invite Friends</CardTitle>
          <CardDescription>Share this link to invite students securely to the platform. They can join your groups directly.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input readOnly value={inviteLink} className="pl-9 bg-background/50 h-11" />
            </div>
            <Button onClick={handleCopy} className="h-11 px-6 shrink-0 gap-2">
              {copied ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Users className="w-5 h-5" /> Your Connections</h3>
        {isLoading ? (
           <div className="text-center py-10"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : friends.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">You haven't connected with anyone yet.</p>
            <p className="text-sm mt-1">Share your invite link above to start networking!</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {friends.map(f => {
              const friendUser = f.initiatorId === user?.id ? f.receiver : f.initiator;
              return (
                <Card key={f.id} className="border-none shadow-sm">
                  <CardContent className="p-4 flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">{friendUser.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{friendUser.name}</h4>
                      <p className="text-sm text-muted-foreground truncate">{friendUser.university || 'University not set'}</p>
                    </div>
                    <Button variant="secondary" size="sm">Message</Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
