
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';

interface AddUserButtonProps {
  onAddUser: (user: {
    first_name: string;
    last_name: string;
    email: string;
    is_pro: boolean;
    category: string;
  }) => void;
}

export const AddUserButton: React.FC<AddUserButtonProps> = ({ onAddUser }) => {
  const [open, setOpen] = useState(false);
  
  const form = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      plan: 'free',
      category: 'daily-beginner',
    }
  });
  
  const handleSubmit = form.handleSubmit((data) => {
    onAddUser({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      is_pro: data.plan === 'pro',
      category: data.category,
    });
    
    // Reset form and close dialog
    form.reset();
    setOpen(false);
  });
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#2DCDA5] hover:bg-[#29B896] text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[#3F3D56]">Add New User</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new user account.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                {...form.register('first_name', { required: 'First name is required' })}
              />
              {form.formState.errors.first_name && (
                <p className="text-red-500 text-xs">{form.formState.errors.first_name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                {...form.register('last_name', { required: 'Last name is required' })}
              />
              {form.formState.errors.last_name && (
                <p className="text-red-500 text-xs">{form.formState.errors.last_name.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              {...form.register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
            />
            {form.formState.errors.email && (
              <p className="text-red-500 text-xs">{form.formState.errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Subscription Plan</Label>
            <RadioGroup 
              defaultValue="free" 
              className="flex space-x-4"
              {...form.register('plan')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="free" id="free" checked={form.watch('plan') === 'free'} onClick={() => form.setValue('plan', 'free')} />
                <Label htmlFor="free" className="cursor-pointer">Free</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pro" id="pro" checked={form.watch('plan') === 'pro'} onClick={() => form.setValue('plan', 'pro')} />
                <Label htmlFor="pro" className="cursor-pointer">Pro</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              {...form.register('category')}
              value={form.watch('category')} 
              onValueChange={(value) => form.setValue('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily-beginner">Daily Beginner</SelectItem>
                <SelectItem value="daily-intermediate">Daily Intermediate</SelectItem>
                <SelectItem value="daily-advanced">Daily Advanced</SelectItem>
                <SelectItem value="business-beginner">Business Beginner</SelectItem>
                <SelectItem value="business-intermediate">Business Intermediate</SelectItem>
                <SelectItem value="business-advanced">Business Advanced</SelectItem>
                <SelectItem value="exam-toefl">Exam - TOEFL</SelectItem>
                <SelectItem value="exam-ielts">Exam - IELTS</SelectItem>
                <SelectItem value="exam-gre">Exam - GRE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#2DCDA5] hover:bg-[#29B896] text-white">
              Add User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
