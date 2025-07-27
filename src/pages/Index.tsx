import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout } from '@/components/Layout';
import { TradingView } from '@/components/TradingView';
import { Portfolio } from '@/components/Portfolio';
import { AdminPanel } from '@/components/AdminPanel';
import { TradeHistory } from '@/components/TradeHistory';
import { useUserStore } from '@/hooks/useUser';

const Index = () => {
  const { currentUser } = useUserStore();
  
  return (
    <Layout>
      <Tabs defaultValue="trade" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trade">Trade</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="history">All Trades</TabsTrigger>
          {currentUser?.role === 'admin' && (
            <TabsTrigger value="admin">Admin</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="trade">
          <TradingView />
        </TabsContent>
        
        <TabsContent value="portfolio">
          <Portfolio />
        </TabsContent>
        
        <TabsContent value="history">
          <TradeHistory />
        </TabsContent>
        
        {currentUser?.role === 'admin' && (
          <TabsContent value="admin">
            <AdminPanel />
          </TabsContent>
        )}
      </Tabs>
    </Layout>
  );
};

export default Index;
