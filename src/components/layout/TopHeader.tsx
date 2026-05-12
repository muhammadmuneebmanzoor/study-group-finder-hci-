import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Bell, Menu, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
// We can reuse Sidebar logic inside a Sheet for mobile 
import Sidebar from './Sidebar';

export default function TopHeader() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-card/80 backdrop-blur-md border-b sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              }
            />
            <SheetContent side="left" className="p-0 w-[260px]">
               {/* A hacky way for mobile sidebar, but creates a duplicate rendering of Sidebar styles which is handled inside Sidebar. Let's make a MobileSidebar later if needed, or just standard links */}
               <div className="flex flex-col h-full bg-card">
                 <div className="p-4 border-b">
                   <span className="font-bold text-xl text-primary">StudySync</span>
                 </div>
                 <div className="flex-1 p-4 grid gap-2">
                    <Link to="/" className="p-2 hover:bg-slate-100 rounded-lg">Dashboard</Link>
                    <Link to="/groups" className="p-2 hover:bg-slate-100 rounded-lg">Browse Groups</Link>
                 </div>
               </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Global Search */}
        <div className="hidden lg:flex items-center relative w-64">
           <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
           <Input placeholder="Search everything..." className="pl-9 bg-slate-100/50 dark:bg-slate-800/50 border-transparent focus-visible:ring-primary rounded-full h-9" />
        </div>
      </div>

      <div className="flex items-center gap-3 relative">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full" />
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground hover:text-foreground">
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
        <div className="h-8 w-px bg-border mx-1" />
        <Button variant="ghost" className="relative h-9 w-9 rounded-full outline-none hover:opacity-80 transition-opacity ml-1" onClick={() => navigate('/profile')}>
          <Avatar className="h-9 w-9 border border-border">
            <AvatarFallback className="bg-primary/20 text-primary font-medium text-xs">
              {user?.name ? getInitials(user.name) : 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </div>
    </header>
  );
}
