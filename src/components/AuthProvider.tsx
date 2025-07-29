import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Demo mode - use real authenticated user for demo purposes
  const [user] = useState<User | null>({
    id: '13aa6ea2-c046-45f2-b7da-983356a03702', // Use actual authenticated user ID
    email: 'demo@example.com',
    user_metadata: { username: 'demo-user' },
    app_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString()
  } as unknown as User);
  const [session] = useState<Session | null>({
    user: {
      id: '13aa6ea2-c046-45f2-b7da-983356a03702', // Use actual authenticated user ID
      email: 'demo@example.com',
      user_metadata: { username: 'demo-user' },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString()
    } as unknown as User,
    access_token: 'demo-token'
  } as unknown as Session);
  const [loading] = useState(false);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, username: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username,
          display_name: username,
        }
      }
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    session,
    signIn,
    signUp,
    signOut,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};