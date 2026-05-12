import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const groupSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  subject: z.string().min(2, "Subject is required"),
  department: z.string().optional(),
  semester: z.string().optional(),
  university: z.string().min(2, "University is required"),
  capacity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 1, {
    message: "Capacity must be a number greater than 1",
  }),
  meetingType: z.string(),
  privacy: z.string(),
  tags: z.string().optional(),
});

export default function GroupCreate() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<z.infer<typeof groupSchema>>({
    resolver: zodResolver(groupSchema),
    defaultValues: { 
      capacity: "10",
      meetingType: "online",
      privacy: "public"
    }
  });

  const onSubmit = async (data: z.infer<typeof groupSchema>) => {
    setIsLoading(true);
    try {
      const res = await api.post('/groups', data);
      toast.success("Group created successfully");
      navigate(`/groups/${res.data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create group");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-3xl py-4">
      <Card className="border-none shadow-md">
        <CardHeader className="bg-primary/5 border-b mb-6">
          <CardTitle className="text-2xl text-primary">Create Study Group</CardTitle>
          <CardDescription>Start a new group to collaborate with fellow students.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold tracking-tight border-b pb-2">Basic Information</h3>
              <div className="space-y-2">
                <Label>Group Title <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. Advanced Calculus Study Group" {...register('title')} />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Description <span className="text-destructive">*</span></Label>
                <Textarea 
                  placeholder="What will this group focus on? Add goals, rules, or resources." 
                  className="min-h-[100px]"
                  {...register('description')} 
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
              </div>
            </div>

            {/* Academic Info */}
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-semibold tracking-tight border-b pb-2">Academic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>University <span className="text-destructive">*</span></Label>
                  <Input placeholder="e.g. MIT, Stanford, NUS" {...register('university')} />
                  {errors.university && <p className="text-sm text-destructive">{errors.university.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Subject / Course Code <span className="text-destructive">*</span></Label>
                  <Input placeholder="e.g. MATH 201" {...register('subject')} />
                  {errors.subject && <p className="text-sm text-destructive">{errors.subject.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input placeholder="e.g. Mathematics" {...register('department')} />
                </div>
                <div className="space-y-2">
                  <Label>Semester</Label>
                  <Input placeholder="e.g. Fall 2024" {...register('semester')} />
                </div>
              </div>
            </div>

            {/* Logistics & Settings */}
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-semibold tracking-tight border-b pb-2">Logistics & Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Max Members</Label>
                  <Input type="number" {...register('capacity')} />
                  {errors.capacity && <p className="text-sm text-destructive">{errors.capacity.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label>Meeting Type</Label>
                  <Select onValueChange={(val) => setValue('meetingType', val)} defaultValue={watch('meetingType')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">Offline / In-person</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Privacy</Label>
                  <Select onValueChange={(val) => setValue('privacy', val)} defaultValue={watch('privacy')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select privacy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private (Invite/Request only)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                  <Label>Tags (Comma separated)</Label>
                  <Input placeholder="e.g. math, exam prep, studying" {...register('tags')} />
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t justify-end">
              <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" disabled={isLoading} className="px-8">{isLoading ? 'Creating...' : 'Create Study Group'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
