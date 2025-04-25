
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAuthStatus = () => {
  const [loading, setLoading] = useState(true);
  const [userNickname, setUserNickname] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        console.log("No session found, redirecting to login");
        navigate('/login');
        toast({
          title: "Authentication required",
          description: "Please login to access your dashboard",
        });
        return;
      }
      
      if (data.session.user.email === 'rajkota.sql@gmail.com') {
        console.log("Admin user detected");
        setIsAdmin(true);
        
        try {
          const { data: hasAdminRole, error } = await supabase.rpc('has_role', { 
            _user_id: data.session.user.id,
            _role: 'admin'
          });
          
          if (error) {
            console.error('Error checking admin role:', error);
          } else if (!hasAdminRole) {
            console.log("Admin email but no admin role found, adding admin role");
            const { error: roleError } = await supabase
              .from('user_roles')
              .insert({
                user_id: data.session.user.id,
                role: 'admin'
              });
              
            if (roleError) {
              console.error('Error adding admin role:', roleError);
            } else {
              console.log("Admin role added successfully");
            }
          }
        } catch (error) {
          console.error('Failed to check admin role:', error);
        }
      }
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('nick_name, first_name')
        .eq('id', data.session.user.id)
        .single();
      
      if (profileData) {
        setUserNickname(profileData.nick_name || profileData.first_name || 'there');
      }
      
      setLoading(false);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          navigate('/login');
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return { loading, userNickname, isAdmin };
};
