import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Info, Users, MapPin, SearchX, Filter, Laptop, Building2, Flame } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useDebounce } from '../hooks/useDebounce';
import { motion } from 'motion/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function GroupList() {
  const [groups, setGroups] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, trending, my-groups
  const [meetingType, setMeetingType] = useState('all');
  const [semester, setSemester] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    setIsLoading(true);
    
    const params = new URLSearchParams({
      search: debouncedSearch,
      filter,
      ...(meetingType !== 'all' ? { meetingType } : {}),
      ...(semester !== 'all' ? { semester } : {})
    });

    api.get(`/groups?${params.toString()}`)
      .then(res => setGroups(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [debouncedSearch, filter, meetingType, semester]);

  const getMeetingIcon = (type: string) => {
    switch (type) {
      case 'online': return <Laptop className="w-3.5 h-3.5 mr-1" />;
      case 'offline': return <MapPin className="w-3.5 h-3.5 mr-1" />;
      case 'hybrid': return <Building2 className="w-3.5 h-3.5 mr-1" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Discover Groups</h1>
          <p className="text-muted-foreground">Find and join study groups that match your interests.</p>
        </div>
      </div>

      <div className="bg-card p-4 rounded-xl border shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by title, subject, university or tags..." 
            className="pl-9 bg-background h-10 border-slate-200 dark:border-slate-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <Tabs defaultValue="all" onValueChange={setFilter} className="shrink-0">
            <TabsList className="h-10">
              <TabsTrigger value="all">All Groups</TabsTrigger>
              <TabsTrigger value="trending" className="data-[state=active]:text-orange-500"><Flame className="w-3.5 h-3.5 mr-1"/> Trending</TabsTrigger>
              <TabsTrigger value="my-groups">My Groups</TabsTrigger>
            </TabsList>
          </Tabs>

          <Sheet>
            <SheetTrigger
              render={
                <Button variant="outline" className="h-10 shrink-0 gap-2">
                  <Filter className="w-4 h-4" /> Filters
                </Button>
              }
            />
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Smart Filtering</SheetTitle>
                <SheetDescription>Refine your study group search</SheetDescription>
              </SheetHeader>
              <div className="grid gap-6 py-6">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Meeting Type</h4>
                  <Select value={meetingType} onValueChange={setMeetingType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any type</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">Offline / In-person</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Semester</h4>
                  <Select value={semester} onValueChange={setSemester}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any semester</SelectItem>
                      <SelectItem value="Fall 2024">Fall 2024</SelectItem>
                      <SelectItem value="Spring 2025">Spring 2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Could add University, Group Size, tags dropdowns here */}
                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full" onClick={() => { setMeetingType('all'); setSemester('all'); setFilter('all'); setSearchTerm(''); }}>Reset Filters</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse border-none shadow-md">
              <CardHeader className="h-32 bg-muted/50 rounded-t-xl" />
              <CardContent className="p-5 space-y-3">
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-2xl border border-dashed shadow-sm">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
            <SearchX className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No groups found</h3>
          <p className="text-muted-foreground mt-1 max-w-sm mx-auto">We couldn't find any study groups matching your search criteria. Try adjusting your filters.</p>
          <Button variant="outline" className="mt-6" onClick={() => { setSearchTerm(''); setMeetingType('all'); setSemester('all'); setFilter('all'); }}>Clear Search</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group, idx) => (
            <motion.div key={group.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
              <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-300 border-none shadow-md cursor-pointer group" onClick={() => window.location.href = `/groups/${group.id}`}>
                <CardHeader className="p-5 pb-4 bg-gradient-to-br from-primary/5 to-transparent rounded-t-xl border-b border-border/40">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="secondary" className="font-medium bg-background shadow-sm border border-border/50 text-xs">
                      {group.subject}
                    </Badge>
                    <div className="flex items-center text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                      <Users className="w-3.5 h-3.5 mr-1" />
                      {group.members?.length || 1}/{group.capacity}
                    </div>
                  </div>
                  <CardTitle className="line-clamp-1 text-xl group-hover:text-primary transition-colors">{group.title}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-1.5 min-h-[2.5rem] leading-relaxed">
                    {group.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-4 flex-1">
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      {getMeetingIcon(group.meetingType || 'online')}
                      <span className="capitalize truncate">{group.meetingType || 'online'}</span>
                    </div>
                    {group.university && (
                      <div className="flex items-center font-medium text-foreground">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-muted-foreground shrink-0" />
                        <span className="truncate">{group.university}</span>
                      </div>
                    )}
                  </div>
                  
                  {group.tags && (
                    <div className="flex flex-wrap gap-1.5">
                      {group.tags.split(',').slice(0, 3).map((tag: string) => (
                        <span key={tag} className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-muted text-muted-foreground rounded-md">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="p-5 pt-0 mt-auto flex flex-col gap-4">
                  <Button variant="default" className="w-full">View Details</Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
