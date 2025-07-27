import { useState } from 'react';
import { 
  TrendingUp, 
  Briefcase, 
  BarChart3, 
  History, 
  Settings, 
  Star,
  Users,
  PieChart
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { useUserStore } from '@/hooks/useUser';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const mainItems = [
  { title: 'Movies', value: 'trade', icon: TrendingUp },
  { title: 'Portfolio', value: 'portfolio', icon: Briefcase },
  { title: 'Watchlist', value: 'watchlist', icon: Star },
  { title: 'Analytics', value: 'analytics', icon: BarChart3 },
  { title: 'Trade History', value: 'history', icon: History },
];

const adminItems = [
  { title: 'Admin Panel', value: 'admin', icon: Users },
  { title: 'Reports', value: 'reports', icon: PieChart },
  { title: 'Settings', value: 'settings', icon: Settings },
];

export function AppSidebar({ activeTab, onTabChange }: SidebarProps) {
  const { state } = useSidebar();
  const { currentUser } = useUserStore();

  const isActive = (value: string) => activeTab === value;
  const isCollapsed = state === 'collapsed';

  const handleItemClick = (value: string) => {
    onTabChange(value);
  };

  return (
    <Sidebar className="border-r border-border bg-card" collapsible="icon">
      <SidebarContent>
        <div className="p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Trading
          </div>
          <SidebarMenu>
            {mainItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  className={`w-full justify-start cursor-pointer mb-1 ${
                    isActive(item.value) 
                      ? 'bg-primary text-primary-foreground font-medium' 
                      : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => handleItemClick(item.value)}
                >
                  <item.icon className="h-4 w-4" />
                  {!isCollapsed && <span className="ml-3">{item.title}</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>

        {currentUser?.role === 'admin' && (
          <div className="p-4 border-t border-border">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Admin
            </div>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    className={`w-full justify-start cursor-pointer mb-1 ${
                      isActive(item.value) 
                        ? 'bg-primary text-primary-foreground font-medium' 
                        : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => handleItemClick(item.value)}
                  >
                    <item.icon className="h-4 w-4" />
                    {!isCollapsed && <span className="ml-3">{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}