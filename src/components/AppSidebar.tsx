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

const mainItems = [
  { title: 'Movies', url: '#movies', icon: TrendingUp },
  { title: 'Portfolio', url: '#portfolio', icon: Briefcase },
  { title: 'Watchlist', url: '#watchlist', icon: Star },
  { title: 'Analytics', url: '#analytics', icon: BarChart3 },
  { title: 'Trade History', url: '#history', icon: History },
];

const adminItems = [
  { title: 'Admin Panel', url: '#admin', icon: Users },
  { title: 'Reports', url: '#reports', icon: PieChart },
  { title: 'Settings', url: '#settings', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { currentUser } = useUserStore();
  const [activeItem, setActiveItem] = useState('movies');

  const isActive = (url: string) => activeItem === url.replace('#', '');
  const isCollapsed = state === 'collapsed';

  const handleItemClick = (url: string) => {
    setActiveItem(url.replace('#', ''));
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
                    asChild
                    className={`w-full justify-start ${
                      isActive(item.url) 
                        ? 'bg-primary/10 text-primary border-r-2 border-primary' 
                        : 'hover:bg-accent/50'
                    }`}
                  >
                    <button onClick={() => handleItemClick(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span className="ml-2">{item.title}</span>}
                    </button>
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
                      asChild
                      className={`w-full justify-start ${
                        isActive(item.url) 
                          ? 'bg-primary/10 text-primary border-r-2 border-primary' 
                          : 'hover:bg-accent/50'
                      }`}
                    >
                      <button onClick={() => handleItemClick(item.url)}>
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && <span className="ml-2">{item.title}</span>}
                      </button>
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