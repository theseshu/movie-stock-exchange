import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { format, subDays, subWeeks, subMonths, subYears } from 'date-fns';

interface StockChartProps {
  movieId: string;
  currentPrice: number;
}

interface PriceData {
  date: string;
  price: number;
  timestamp: Date;
}

const timePeriods = [
  { label: '1D', value: '1D', days: 1 },
  { label: '1W', value: '1W', days: 7 },
  { label: '1M', value: '1M', days: 30 },
  { label: '3M', value: '3M', days: 90 },
  { label: '6M', value: '6M', days: 180 },
  { label: '1Y', value: '1Y', days: 365 },
  { label: '3Y', value: '3Y', days: 1095 },
  { label: '5Y', value: '5Y', days: 1825 },
  { label: 'All', value: 'All', days: null },
];

export function StockChart({ movieId, currentPrice }: StockChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('1D');
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPriceData();
  }, [movieId, selectedPeriod]);

  const fetchPriceData = async () => {
    setLoading(true);
    try {
      const selectedPeriodData = timePeriods.find(p => p.value === selectedPeriod);
      let fromDate: string | undefined;
      
      if (selectedPeriodData?.days) {
        fromDate = subDays(new Date(), selectedPeriodData.days).toISOString();
      }

      let query = supabase
        .from('trades')
        .select('price, executed_at')
        .eq('movie_id', movieId)
        .order('executed_at', { ascending: true });

      if (fromDate) {
        query = query.gte('executed_at', fromDate);
      }

      const { data: trades, error } = await query.limit(1000);

      if (error) {
        console.error('Error fetching price data:', error);
        return;
      }

      if (!trades || trades.length === 0) {
        // If no trades, show current price as a flat line
        const now = new Date();
        const startDate = fromDate ? new Date(fromDate) : subDays(now, 1);
        setPriceData([
          { 
            date: format(startDate, selectedPeriod === '1D' ? 'HH:mm' : 'MMM dd'), 
            price: currentPrice, 
            timestamp: startDate 
          },
          { 
            date: format(now, selectedPeriod === '1D' ? 'HH:mm' : 'MMM dd'), 
            price: currentPrice, 
            timestamp: now 
          }
        ]);
        setLoading(false);
        return;
      }

      // Group trades by time intervals based on selected period
      const groupedData = new Map<string, number>();
      
      trades.forEach(trade => {
        const tradeDate = new Date(trade.executed_at);
        let dateKey: string;
        
        if (selectedPeriod === '1D') {
          dateKey = format(tradeDate, 'HH:mm');
        } else if (['1W', '1M'].includes(selectedPeriod)) {
          dateKey = format(tradeDate, 'MMM dd');
        } else {
          dateKey = format(tradeDate, 'MMM yyyy');
        }
        
        groupedData.set(dateKey, Number(trade.price));
      });

      // Convert to array format for chart
      const chartData: PriceData[] = Array.from(groupedData.entries()).map(([date, price]) => ({
        date,
        price,
        timestamp: new Date() // Using current time for sorting, actual timestamp parsing would be more complex
      }));

      // Add current price as the latest point if we have recent data
      if (chartData.length > 0) {
        const now = new Date();
        const latestDateKey = selectedPeriod === '1D' ? format(now, 'HH:mm') : format(now, 'MMM dd');
        
        // Only add current price if it's not already the latest entry
        const lastEntry = chartData[chartData.length - 1];
        if (lastEntry.date !== latestDateKey) {
          chartData.push({
            date: latestDateKey,
            price: currentPrice,
            timestamp: now
          });
        }
      }

      setPriceData(chartData);
    } catch (error) {
      console.error('Error fetching price data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    price: {
      label: "Price",
      color: "hsl(var(--primary))",
    },
  };

  const formatTooltipValue = (value: any, name: string) => {
    if (name === 'price') {
      return [`$${Number(value).toFixed(2)}`, 'Price'];
    }
    return [value, name];
  };

  // Calculate price change
  const priceChange = priceData.length >= 2 
    ? priceData[priceData.length - 1].price - priceData[0].price 
    : 0;
  const priceChangePercent = priceData.length >= 2 
    ? (priceChange / priceData[0].price) * 100 
    : 0;

  return (
    <Card className="premium-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold premium-text">Price Chart</CardTitle>
        
        {/* Price Change Indicator */}
        {priceData.length >= 2 && (
          <div className="flex items-center gap-2 text-sm">
            <span className={`font-medium ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
            </span>
            <span className="text-muted-foreground">for {selectedPeriod}</span>
          </div>
        )}

        {/* Time Period Buttons */}
        <div className="flex flex-wrap gap-1">
          {timePeriods.map((period) => (
            <Button
              key={period.value}
              variant={selectedPeriod === period.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period.value)}
              className="text-xs px-3 py-1 h-8"
            >
              {period.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <LineChart data={priceData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                domain={['dataMin - 5', 'dataMax + 5']}
                tickFormatter={(value) => `$${value}`}
              />
              <ChartTooltip 
                content={<ChartTooltipContent formatter={formatTooltipValue} />}
                cursor={{
                  stroke: "hsl(var(--primary))",
                  strokeWidth: 1,
                  strokeDasharray: "3 3"
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                activeDot={{ 
                  r: 4, 
                  fill: "hsl(var(--primary))",
                  stroke: "hsl(var(--background))",
                  strokeWidth: 2
                }}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}