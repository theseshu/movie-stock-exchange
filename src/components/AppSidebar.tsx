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
    <Sidebar className={isCollapsed ? 'w-14' : 'w-64'} collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent className="border-r border-border">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Trading
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    className={`w-full justify-start cursor-pointer ${
                      isActive(item.value) 
                        ? 'bg-primary/10 text-primary border-r-2 border-primary' 
                        : 'hover:bg-accent/50'
                    }`}
                    onClick={() => handleItemClick(item.value)}
                  >
                    <item.icon className="h-4 w-4" />
                    {!isCollapsed && <span className="ml-2">{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {currentUser?.role === 'admin' && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      className={`w-full justify-start cursor-pointer ${
                        isActive(item.value) 
                          ? 'bg-primary/10 text-primary border-r-2 border-primary' 
                          : 'hover:bg-accent/50'
                      }`}
                      onClick={() => handleItemClick(item.value)}
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span className="ml-2">{item.title}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}