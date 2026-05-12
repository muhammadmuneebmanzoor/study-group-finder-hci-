import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Search,
  Users,
  PlusCircle,
  MessageSquare,
  Calendar,
  Bell,
  Heart,
  Star,
  User,
  LogOut,
  Settings,
  BookOpen
} from 'lucide-react';
import { api } from '../../lib/api';
import { toast } from 'sonner';

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      logout();
      toast.success("Logged out successfully");
    } catch {
      toast.error("Failed to log out");
    }
  };

  const navItemClass = (path: string) => cn(
    "flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-sm font-medium",
    location.pathname === path 
      ? "bg-primary/10 text-primary" 
      : "text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800"
  );

  return (
    <aside className="w-[260px] h-screen bg-card border-r border-border flex flex-col fixed left-0 top-0 overflow-y-auto hidden md:flex">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-primary rounded-xl">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight text-primary">StudySync</span>
        </Link>
      </div>

      <div className="flex-1 px-4 py-6 space-y-8">
        
        {/* MAIN */}
        <div className="space-y-2">
          <div className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">Main</div>
          <Link to="/" className={navItemClass("/")}>
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <Link to="/groups" className={navItemClass("/groups")}>
            <Search className="w-4 h-4" /> Browse Groups
          </Link>
          <Link to="/groups?filter=my-groups" className={navItemClass("/groups?filter=my-groups")}>
            <Users className="w-4 h-4" /> My Groups
          </Link>
          <Link to="/groups/create" className={navItemClass("/groups/create")}>
            <PlusCircle className="w-4 h-4" /> Create Group
          </Link>
        </div>

        {/* PERSONAL */}
        <div className="space-y-2">
          <div className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">Personal</div>
          <Link to="/messages" className={navItemClass("/messages")}>
            <MessageSquare className="w-4 h-4" /> Messages
          </Link>
          <Link to="/scheduler" className={navItemClass("/scheduler")}>
            <Calendar className="w-4 h-4" /> Scheduler
          </Link>
          <Link to="/notifications" className={navItemClass("/notifications")}>
            <Bell className="w-4 h-4" /> Notifications
          </Link>
          <Link to="/friends" className={navItemClass("/friends")}>
            <Heart className="w-4 h-4" /> Friends
          </Link>
          <Link to="/ratings" className={navItemClass("/ratings")}>
            <Star className="w-4 h-4" /> Ratings
          </Link>
          <Link to="/profile" className={navItemClass("/profile")}>
            <User className="w-4 h-4" /> My Profile
          </Link>
        </div>
        
      </div>

      <div className="p-4 border-t border-border mt-auto shrink-0">
        <button onClick={handleLogout} className="flex w-full items-center gap-3 px-3 py-2 rounded-xl transition-all text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
          <LogOut className="w-4 h-4" /> Log Out
        </button>
      </div>
    </aside>
  );
}
