
import React, { useState, useEffect } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Calendar, Activity, User, Clock } from 'lucide-react';
import { type User } from '../UserManagementDashboard';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { useMediaQuery } from '@/hooks/use-media-query';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

interface UserDrawerProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
}

interface WordHistory {
  id: string;
  word: string;
  category: string;
  date_sent: string;
}

export const UserDrawer: React.FC<UserDrawerProps> = ({ user, open, onClose }) => {
  const [wordHistory, setWordHistory] = useState<WordHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [savingCategory, setSavingCategory] = useState(false);
  
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    if (user && open) {
      fetchWordHistory();
      setSelectedCategory(user.category || '');
    }
  }, [user, open]);

  const fetchWordHistory = async () => {
    if (!user) return;
    
    try {
      setLoadingHistory(true);
      
      const { data, error } = await supabase
        .from('user_word_history')
        .select('*')
        .eq('user_id', user.id)
        .order('date_sent', { ascending: false })
        .limit(20);
        
      if (error) throw error;
      
      setWordHistory(data || []);
    } catch (error) {
      console.error('Error fetching word history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const updateUserCategory = async () => {
    if (!user) return;
    
    try {
      setSavingCategory(true);
      
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ category: selectedCategory })
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "User category has been updated.",
      });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSavingCategory(false);
    }
  };

  const DrawerContent = () => (
    <div className="space-y-6 p-0 md:p-4">
      {user && (
        <>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <User className="h-5 w-5 text-[#3F3D56]" />
                    User Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                      <p>{user.first_name} {user.last_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p>{user.email}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Plan</p>
                      <Badge 
                        variant="outline" 
                        className={user.is_pro ? 
                          "bg-[#2DCDA5]/10 text-[#2DCDA5] border-[#2DCDA5]/20" : 
                          "bg-gray-100 text-gray-600 border-gray-200"
                        }
                      >
                        {user.is_pro ? 'Pro' : 'Free'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Registered</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p>{formatDate(user.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Activity className="h-5 w-5 text-[#3F3D56]" />
                    Activity & Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Last Active</p>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <p>{formatDate(user.last_active)}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Category</p>
                      <div className="flex items-center gap-2">
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select category" />
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
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={updateUserCategory}
                          disabled={savingCategory || selectedCategory === user.category}
                        >
                          {savingCategory ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Word History</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin h-6 w-6 border-4 border-[#2DCDA5] border-t-transparent rounded-full"></div>
                  </div>
                ) : wordHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No word history found for this user
                  </div>
                ) : (
                  <div className="divide-y max-h-[300px] overflow-y-auto pr-2">
                    {wordHistory.map((item) => (
                      <div key={item.id} className="py-3">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{item.word}</p>
                            <p className="text-sm text-muted-foreground">{item.category}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="ml-2">
                              {formatDate(item.date_sent)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-[90%] max-w-[700px] sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-[#3F3D56] text-xl">User Details</SheetTitle>
            <SheetDescription>
              View and manage user information
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <DrawerContent />
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle className="text-[#3F3D56] text-xl">User Details</DrawerTitle>
            <DrawerDescription>
              View and manage user information
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4">
            <DrawerContent />
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
