import { ReactNode } from 'react';
import { UserSelector } from './UserSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-background">
      <header className="backdrop-blur-xl bg-background/80 border-b border-border/30 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <span className="text-2xl">🎬</span>
              </div>
              <div>
                <h1 className="text-3xl font-playfair font-bold premium-text">
                  MovieTrade
                </h1>
                <p className="text-muted-foreground text-sm">Premium Stock Exchange</p>
              </div>
            </div>
            <UserSelector />
          </div>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}