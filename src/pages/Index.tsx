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
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-5xl font-playfair font-bold premium-text">
            Trade Movie Stocks
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Experience the future of entertainment investing with our premium movie stock exchange platform
          </p>
        </div>
        
        <Tabs defaultValue="trade" className="w-full">
          <TabsList className={`grid w-full h-14 p-1 premium-card ${currentUser?.role === 'admin' ? 'grid-cols-4' : 'grid-cols-2'}`}>
            <TabsTrigger 
              value="trade" 
              className="h-12 text-base font-semibold rounded-xl transition-all duration-300 data-[state=active]:premium-button data-[state=active]:text-primary-foreground"
            >
              Trade
            </TabsTrigger>
            <TabsTrigger 
              value="portfolio" 
              className="h-12 text-base font-semibold rounded-xl transition-all duration-300 data-[state=active]:premium-button data-[state=active]:text-primary-foreground"
            >
              Portfolio
            </TabsTrigger>
            {currentUser?.role === 'admin' && (
              <TabsTrigger 
                value="history" 
                className="h-12 text-base font-semibold rounded-xl transition-all duration-300 data-[state=active]:premium-button data-[state=active]:text-primary-foreground"
              >
                All Trades
              </TabsTrigger>
            )}
            {currentUser?.role === 'admin' && (
              <TabsTrigger 
                value="admin" 
                className="h-12 text-base font-semibold rounded-xl transition-all duration-300 data-[state=active]:premium-button data-[state=active]:text-primary-foreground"
              >
                Admin
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="trade" className="mt-8">
            <TradingView />
          </TabsContent>
          
          <TabsContent value="portfolio" className="mt-8">
            <Portfolio />
          </TabsContent>
          
          {currentUser?.role === 'admin' && (
            <TabsContent value="history" className="mt-8">
              <TradeHistory />
            </TabsContent>
          )}
          
          {currentUser?.role === 'admin' && (
            <TabsContent value="admin" className="mt-8">
              <AdminPanel />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

export default Index;
