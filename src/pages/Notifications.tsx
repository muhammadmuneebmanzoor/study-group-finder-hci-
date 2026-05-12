import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Info, CheckCircle, AlertTriangle, Users } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      // ignore
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'JOIN_REQUEST': return <Users className="w-5 h-5 text-blue-500" />;
      case 'SUCCESS': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'ALERT': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default: return <Info className="w-5 h-5 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return <div className="text-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="p-3 bg-primary/10 rounded-full">
          <Bell className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Stay updated on your study groups and activity.</p>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-24 bg-muted/20 border border-dashed rounded-xl">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium text-muted-foreground">You're all caught up!</p>
          </div>
        ) : (
          notifications.map(notif => (
            <Card key={notif.id} className={`border-none shadow-sm transition-colors ${notif.isRead ? 'bg-background opacity-75' : 'bg-primary/5 ring-1 ring-primary/20'}`}>
              <CardContent className="p-4 flex gap-4 sm:items-center flex-col sm:flex-row">
                <div className="shrink-0 pt-1 sm:pt-0">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-semibold ${!notif.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>{notif.title}</h4>
                    {!notif.isRead && <Badge variant="default" className="text-[10px] px-1.5 py-0">New</Badge>}
                  </div>
                  <p className="text-sm text-foreground/80">{notif.content}</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{format(new Date(notif.createdAt), 'MMM d, h:mm a')}</p>
                </div>
                {!notif.isRead && (
                  <Button variant="ghost" size="sm" onClick={() => markAsRead(notif.id)} className="shrink-0 sm:self-center self-start">
                    Mark as read
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
