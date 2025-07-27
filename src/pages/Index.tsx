import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout } from '@/components/Layout';
import { TradingView } from '@/components/TradingView';
import { Portfolio } from '@/components/Portfolio';
import { AdminPanel } from '@/components/AdminPanel';
import { TradeHistory } from '@/components/TradeHistory';
import { DashboardStats } from '@/components/DashboardStats';
import { useUserStore } from '@/hooks/useUser';

const Index = () => {
  const { currentUser } = useUserStore();
  const [activeTab, setActiveTab] = useState('trade');
  
  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {currentUser?.display_name || 'Trader'}!
          </h1>
          <p className="text-muted-foreground">
            Track your movie investments and discover trending opportunities
          </p>
        </div>

        {/* Dashboard Stats */}
        <DashboardStats />

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-12 bg-muted/50">
            <TabsTrigger value="trade" className="text-sm font-medium">
              Browse Movies
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="text-sm font-medium">
              My Portfolio
            </TabsTrigger>
            <TabsTrigger value="history" className="text-sm font-medium">
              Trade History
            </TabsTrigger>
            {currentUser?.role === 'admin' && (
              <TabsTrigger value="admin" className="text-sm font-medium">
                Admin Panel
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="trade" className="mt-6">
            <TradingView />
          </TabsContent>
          
          <TabsContent value="portfolio" className="mt-6">
            <Portfolio />
          </TabsContent>
          
          <TabsContent value="history" className="mt-6">
            <TradeHistory />
          </TabsContent>
          
          {currentUser?.role === 'admin' && (
            <TabsContent value="admin" className="mt-6">
              <AdminPanel />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

export default Index;