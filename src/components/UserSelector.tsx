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
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">User:</span>
      <Select value={currentUser?.id || ''} onValueChange={handleUserChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Select user" />
        </SelectTrigger>
        <SelectContent>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.display_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {currentUser && (
        <span className="text-sm text-muted-foreground">
          Balance: ${currentUser.wallet_balance.toFixed(2)}
        </span>
      )}
    </div>
  );
}