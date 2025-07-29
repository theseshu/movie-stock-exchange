import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { DemoUser } from '@/types';
import { useUserStore } from '@/hooks/useUser';

export function UserSelector() {
  const [users, setUsers] = useState<DemoUser[]>([]);
  const { currentUser, setCurrentUser } = useUserStore();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('demo_users')
      .select('*')
      .order('username');
    
    if (error) {
      console.error('Error fetching users:', error);
      return;
    }
    
    setUsers(data || []);
    
    // Set first user as default if no user selected
    if (!currentUser && data && data.length > 0) {
      setCurrentUser(data[0]);
    }
  };

  const handleUserChange = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-muted-foreground">Current User:</span>
        <Select value={currentUser?.id || ''} onValueChange={handleUserChange}>
          <SelectTrigger className="w-48 h-12 premium-card border-border/50 text-foreground font-semibold">
            <SelectValue placeholder="Select user" />
          </SelectTrigger>
          <SelectContent className="premium-card border-border/50">
            {users.map((user) => (
              <SelectItem 
                key={user.id} 
                value={user.id}
                className="font-semibold hover:bg-accent/10 focus:bg-accent/10"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  {user.display_name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {currentUser && (
        <div className="premium-card px-4 py-2 border-border/30">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Balance:</span>
            <span className="premium-text text-base font-bold font-mono">
              ₹{currentUser.wallet_balance.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}