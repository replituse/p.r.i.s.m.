import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Calendar,
  Building2,
  Users,
  FolderKanban,
  UserCog,
  BarChart3,
  Settings,
  LogOut,
  Film,
  ChevronDown,
} from "lucide-react";

const menuItems = [
  {
    title: "Operations",
    items: [
      { title: "Dashboard", url: "/", icon: Calendar },
    ],
  },
  {
    title: "Masters",
    items: [
      { title: "Rooms", url: "/masters/rooms", icon: Building2 },
      { title: "Customers", url: "/masters/customers", icon: Users },
      { title: "Projects", url: "/masters/projects", icon: FolderKanban },
      { title: "Editors", url: "/masters/editors", icon: UserCog },
    ],
  },
  {
    title: "Reports",
    items: [
      { title: "Booking Reports", url: "/reports", icon: BarChart3 },
    ],
  },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();
  const [location] = useLocation();

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3.5rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Film className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">P.R.I.S.M.</span>
                <span className="text-xs text-muted-foreground">Booking System</span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            {menuItems.map((group) => (
              <SidebarGroup key={group.title}>
                <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground px-4">
                  {group.title}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={location === item.url}
                          data-testid={`nav-${item.title.toLowerCase().replace(/\s/g, '-')}`}
                        >
                          <Link href={item.url}>
                            <item.icon className="w-4 h-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          <SidebarFooter className="border-t p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-3 h-auto py-2 px-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.profileImageUrl || undefined} />
                    <AvatarFallback className="text-xs">
                      {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start flex-1 overflow-hidden">
                    <span className="text-sm font-medium truncate w-full text-left">
                      {user?.firstName || user?.email?.split("@")[0] || "User"}
                    </span>
                    <span className="text-xs text-muted-foreground truncate w-full text-left">
                      {user?.email || ""}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild data-testid="menu-settings">
                  <Link href="/settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => window.location.href = "/api/logout"}
                  data-testid="menu-logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="h-14 border-b flex items-center justify-between px-4 bg-background">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
              <span className="text-lg font-bold tracking-wide" data-testid="header-title">PRISM Software</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-muted/30">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
