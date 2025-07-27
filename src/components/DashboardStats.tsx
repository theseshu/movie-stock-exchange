import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
}

function StatsCard({ title, value, change, changeType, icon: Icon }: StatsCardProps) {
  const changeColor = {
    positive: 'text-primary',
    negative: 'text-destructive',
    neutral: 'text-muted-foreground'
  }[changeType];

  const ChangeIcon = changeType === 'positive' ? TrendingUp : TrendingDown;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className={`text-xs flex items-center space-x-1 ${changeColor}`}>
          <ChangeIcon className="h-3 w-3" />
          <span>{change}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Portfolio Value"
        value="$45,231.89"
        change="+20.1% from last month"
        changeType="positive"
        icon={DollarSign}
      />
      <StatsCard
        title="Active Trades"
        value="23"
        change="+180.1% from last month"
        changeType="positive"
        icon={Activity}
      />
      <StatsCard
        title="Movies Watched"
        value="12"
        change="+19% from last month"
        changeType="positive"
        icon={TrendingUp}
      />
      <StatsCard
        title="Total Returns"
        value="$5,234"
        change="+4.75% from last month"
        changeType="positive"
        icon={TrendingUp}
      />
    </div>
  );
}