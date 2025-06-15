
import { Home, ShoppingCart, User, Settings, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Main navigation items
const menuItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Cart",
    url: "/cart",
    icon: ShoppingCart,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

const secondaryItems = [
  {
    title: "Logout",
    url: "/auth?logout=true",
    icon: LogOut,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        {/* Main navigation group */}
        <div className="mb-6" aria-label="Main navigation">
          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Main
          </div>
          <div>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      className="flex items-center gap-2 px-2 py-1 w-full rounded hover:bg-muted transition-colors"
                    >
                      <item.icon className="w-4 h-4" aria-hidden />
                      <span className="text-sm font-medium">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </div>
        </div>
        {/* Account group - sticky at bottom if sidebar is tall */}
        <div className="mt-auto" aria-label="Account actions">
          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Account
          </div>
          <div>
            <SidebarMenu>
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      className="flex items-center gap-2 px-2 py-1 w-full rounded hover:bg-muted transition-colors"
                    >
                      <item.icon className="w-4 h-4" aria-hidden />
                      <span className="text-sm font-medium">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export default AppSidebar;
