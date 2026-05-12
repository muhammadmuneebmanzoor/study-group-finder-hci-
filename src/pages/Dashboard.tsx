import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, PlusCircle, Calendar, ArrowRight, Laptop, Building2, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/groups')
      .then(res => setGroups(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getMeetingIcon = (type: string) => {
    switch (type) {
      case 'online': return <Laptop className="w-3 h-3 mr-1" />;
      case 'offline': return <MapPin className="w-3 h-3 mr-1" />;
      case 'hybrid': return <Building2 className="w-3 h-3 mr-1" />;
      default: return <Laptop className="w-3 h-3 mr-1" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-2xl border border-primary/10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-muted-foreground mt-1 text-lg">Ready to conquer your next study session?</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Button onClick={() => navigate('/groups/create')} className="gap-2">
            <PlusCircle className="w-4 h-4" /> Create Group
          </Button>
          <Button onClick={() => navigate('/groups')} variant="outline" className="gap-2 bg-background">
            <Users className="w-4 h-4" /> Join Group
          </Button>
          <Button onClick={() => navigate('/profile')} variant="outline" className="gap-2 bg-background">
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Recommended Groups */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold tracking-tight">Recommended Study Groups</h2>
              <Link to="/groups" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => (
                  <Card key={i} className="flex flex-col border-none shadow-sm h-[200px]">
                    <Skeleton className="h-full w-full rounded-xl" />
                  </Card>
                ))}
              </div>
            ) : groups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.slice(0, 2).map((group: any) => (
                  <Card key={group.id} className="flex flex-col hover:shadow-md transition-shadow cursor-pointer overflow-hidden border-border/50" onClick={() => navigate(`/groups/${group.id}`)}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg line-clamp-1">{group.title}</CardTitle>
                        <Badge variant="secondary" className="font-normal capitalize flex items-center shrink-0 ml-2">
                          {getMeetingIcon(group.meetingType || 'online')}
                          {group.meetingType || 'online'}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-1 text-xs">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span className="font-medium text-foreground">{group.subject}</span>
                        {group.university && <span className="text-muted-foreground ml-1">• {group.university}</span>}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-sm text-muted-foreground line-clamp-2">{group.description}</p>
                    </CardContent>
                    <CardFooter className="pt-0 flex items-center justify-between border-t border-border/40 pb-3 pt-3 bg-slate-50/50 dark:bg-slate-900/50">
                      <div className="flex items-center -space-x-2">
                        {group.members.slice(0, 3).map((m: any) => (
                          <Avatar key={m.userId} className="w-7 h-7 border-2 border-background">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${m.user?.name || m.userId}`} />
                            <AvatarFallback className="text-[10px]">{getInitials(m.user?.name || 'U')}</AvatarFallback>
                          </Avatar>
                        ))}
                        {group.members.length > 3 && (
                          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium border-2 border-background z-10 text-muted-foreground">
                            +{group.members.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">{group.members.length} / {group.capacity} members</span>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-xl bg-card border border-dashed border-border">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-1">No groups found</h3>
                <p className="text-sm text-muted-foreground mb-4">Be the first to create a study group.</p>
                <Button onClick={() => navigate('/groups/create')} size="sm">Create Group</Button>
              </div>
            )}
          </section>

          {/* Recently Active Groups */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold tracking-tight">Recently Active Groups</h2>
            </div>
            {isLoading ? (
               <Skeleton className="h-[120px] w-full rounded-xl" />
            ) : groups.length > 2 ? (
              <div className="grid gap-3">
                {groups.slice(-3).reverse().map((group: any) => (
                   <div key={group.id} onClick={() => navigate(`/groups/${group.id}`)} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors">
                     <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                       <BookOpen className="w-6 h-6" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <h3 className="font-medium truncate">{group.title}</h3>
                       <p className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                         <span className="truncate">{group.subject}</span>
                         <span>•</span>
                         <span>{group.members.length} active members</span>
                       </p>
                     </div>
                     <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground">
                        <ArrowRight className="w-4 h-4" />
                     </Button>
                   </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-xl">Play around and join more groups to see recent activity here.</div>
            )}
          </section>

        </div>

        {/* Sidebar content */}
        <div className="space-y-6">
          {/* Upcoming Sessions Calendar */}
          <Card className="border-none shadow-sm bg-gradient-to-b from-card to-card/50">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Upcoming Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 flex flex-col items-center justify-center text-center text-sm text-muted-foreground min-h-[140px]">
                <Calendar className="w-8 h-8 opacity-20 mb-2" />
                <p>No upcoming sessions scheduled.</p>
                <Button variant="link" size="sm" className="mt-1 h-auto py-0">Schedule one</Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications / Activity */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                <div className="p-4 text-sm flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shrink-0" />
                  <div>
                    <span className="font-medium">Calculus 101</span> group has a new shared document.
                    <p className="text-xs text-muted-foreground mt-0.5">2 hours ago</p>
                  </div>
                </div>
                <div className="p-4 text-sm flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-green-500 shrink-0" />
                  <div>
                    <span className="font-medium">Sarah</span> accepted your friend request.
                    <p className="text-xs text-muted-foreground mt-0.5">5 hours ago</p>
                  </div>
                </div>
                <div className="p-4 text-sm flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-amber-500 shrink-0" />
                  <div>
                    You have a meeting for <span className="font-medium">Physics Study</span> tomorrow.
                    <p className="text-xs text-muted-foreground mt-0.5">1 day ago</p>
                  </div>
                </div>
              </div>
              <div className="p-2 border-t border-border/50">
                <Button variant="ghost" className="w-full text-xs text-muted-foreground h-8" onClick={() => navigate('/notifications')}>View all notifications</Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
