import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageSquareQuote } from 'lucide-react';
import { toast } from 'sonner';

export default function Ratings() {
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  
  const [ratingData, setRatingData] = useState({ rating: 5, review: '' });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      // Get all groups with ratings
      const res = await api.get('/groups?filter=my-groups');
      setGroups(res.data);
    } catch(err) {
      toast.error('Failed to load groups');
    } finally {
      setIsLoading(false);
    }
  };

  const submitReview = async () => {
    if(!selectedGroup) return;
    try {
      await api.post(`/groups/${selectedGroup.id}/ratings`, ratingData);
      toast.success('Review submitted successfully!');
      setSelectedGroup(null);
      // maybe fetch updated ratings here if we were displaying them inside the card
    } catch (err) {
      toast.error('Failed to submit review');
    }
  };

  if(isLoading) return <div className="text-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Group Reviews & Ratings</h1>
        <p className="text-muted-foreground">Share your experience and rate the study groups you belong to.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {groups.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-muted/20 border border-dashed rounded-xl">
             <MessageSquareQuote className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
             <p className="text-muted-foreground">Join some study groups to write a review.</p>
          </div>
        ) : (
          groups.map(group => (
            <Card key={group.id} className="border-none shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">{group.title}</CardTitle>
                <CardDescription className="line-clamp-2">{group.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={selectedGroup?.id === group.id} onOpenChange={(open) => !open && setSelectedGroup(null)}>
                  <DialogTrigger
                    render={
                      <Button variant="secondary" className="w-full" onClick={() => {
                          setSelectedGroup(group);
                          setRatingData({ rating: 5, review: '' });
                      }}>Write Review</Button>
                    }
                  />
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Review {group.title}</DialogTitle>
                      <DialogDescription>Your feedback helps other students find great study groups.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      <div className="space-y-4">
                        <Label>Rating</Label>
                        <div className="flex gap-2">
                          {[1,2,3,4,5].map(star => (
                            <button key={star} onClick={() => setRatingData({...ratingData, rating: star})} className="focus:outline-none transition-transform hover:scale-110">
                              <Star className={`w-8 h-8 ${ratingData.rating >= star ? 'fill-orange-400 text-orange-400' : 'text-muted-foreground/30'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Review (Optional)</Label>
                        <Textarea 
                          placeholder="What did you like about this group?" 
                          value={ratingData.review}
                          onChange={e => setRatingData({...ratingData, review: e.target.value})}
                          rows={4}
                        />
                      </div>
                      <Button onClick={submitReview} className="w-full">Submit Feedback</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
