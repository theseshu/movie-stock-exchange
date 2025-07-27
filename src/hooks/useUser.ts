import { create } from 'zustand';
import { DemoUser } from '@/types';

interface UserStore {
  currentUser: DemoUser | null;
  setCurrentUser: (user: DemoUser) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
}));