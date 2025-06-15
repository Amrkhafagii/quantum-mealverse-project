
import React, { useState, useRef } from "react";
import { Home, ShoppingCart, User, Settings, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

// The default sidebar items
const defaultMenuItems = [
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
  // Animation: for slide-in/out transitions (Tailwind built-in classes)
  // Drag-and-drop: current menu item order
  const [menuItems, setMenuItems] = useState(defaultMenuItems);
  // Search filter support
  const [searchTerm, setSearchTerm] = useState("");
  // Drag-and-drop state
  const dragIndex = useRef<number | null>(null);

  const location = useLocation();

  // Filter for search
  const filteredMenuItems = searchTerm
    ? menuItems.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : menuItems;

  // Drag-and-drop handlers (reorder local state)
  const handleDragStart = (idx: number) => {
    dragIndex.current = idx;
  };
  const handleDragEnter = (idx: number) => {
    if (dragIndex.current === null || dragIndex.current === idx) return;
    const newItems = [...menuItems];
    const [dragged] = newItems.splice(dragIndex.current, 1);
    newItems.splice(idx, 0, dragged);
    setMenuItems(newItems);
    dragIndex.current = idx;
  };
  const handleDragEnd = () => {
    dragIndex.current = null;
  };

  return (
    <Sidebar>
      <SidebarContent className="transition-all duration-200 animate-fade-in">
        {/* Main navigation with animation at slide-in */}
        <div className="mb-6" aria-label="Main navigation">
          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Main
          </div>
          <div>
            {/* Search/filter input */}
            <div className="px-2 pb-2 pt-1">
              <input
                className="w-full px-2 py-1 rounded bg-muted text-sm focus:outline-none focus:ring-1 focus:ring-quantum-cyan transition"
                type="text"
                autoComplete="off"
                placeholder="Search menu…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <SidebarMenu>
              {filteredMenuItems.map((item, idx) => (
                <SidebarMenuItem
                  key={item.title}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragEnter={() => handleDragEnter(idx)}
                  onDragEnd={handleDragEnd}
                  className="group"
                  // Add animation on hover with Tailwind
                >
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-2 px-2 py-1 w-full rounded transition-colors duration-200 outline-none cursor-pointer",
                          "hover:bg-quantum-cyan/10 hover:text-quantum-cyan hover:scale-105 hover-scale",
                          isActive
                            ? "bg-quantum-cyan/10 text-quantum-cyan font-bold"
                            : "text-foreground"
                        )
                      }
                      tabIndex={0} // Allow keyboard nav
                    >
                      <item.icon className="w-4 h-4 transition-transform duration-100 group-hover:scale-110" aria-hidden />
                      <span className="text-sm font-medium">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            {/* Drag-and-drop tip for accessibility */}
            <div className="px-2 pt-2 text-xs text-muted-foreground">
              Drag to reorder<br className="block sm:hidden" />
              <span className="hidden sm:inline">menu</span>
            </div>
          </div>
        </div>
        {/* Account actions, stick to bottom if sidebar is tall */}
        <div className="mt-auto" aria-label="Account actions">
          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Account
          </div>
          <div>
            <SidebarMenu>
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-2 px-2 py-1 w-full rounded hover:bg-muted transition-colors",
                          isActive ? "bg-muted font-semibold" : ""
                        )
                      }
                    >
                      <item.icon className="w-4 h-4" aria-hidden />
                      <span className="text-sm font-medium">{item.title}</span>
                    </NavLink>
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

// --- Sidebar Templates for Common Use Cases ---

// Minimal sidebar: just icons
export function MinimalSidebar() {
  const items = [
    { title: "Home", url: "/", icon: Home },
    { title: "Cart", url: "/cart", icon: ShoppingCart },
  ];
  return (
    <Sidebar>
      <SidebarContent className="items-center justify-center">
        <SidebarMenu>
          {items.map(item => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  className={({ isActive }) =>
                    cn(
                      "flex justify-center items-center w-10 h-10 rounded-full m-2 transition-all hover:scale-110 hover:bg-quantum-cyan/10",
                      isActive ? "bg-quantum-cyan/20 text-quantum-cyan" : ""
                    )
                  }
                >
                  <item.icon className="w-5 h-5" aria-hidden />
                  <span className="sr-only">{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}

// Sidebar with categories/group labels
export function GroupedSidebar() {
  const dashboardGroup = [
    { title: "Home", url: "/", icon: Home },
    { title: "Profile", url: "/profile", icon: User },
  ];
  const settingsGroup = [
    { title: "Settings", url: "/settings", icon: Settings }
  ];
  return (
    <Sidebar>
      <SidebarContent>
        <div className="mb-4" aria-label="Dashboard">
          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Dashboard
          </div>
          <SidebarMenu>
            {dashboardGroup.map(item => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <NavLink
                    to={item.url}
                    className="flex items-center gap-2 px-2 py-1 w-full rounded hover:bg-muted"
                  >
                    <item.icon className="w-4 h-4" aria-hidden />
                    <span className="text-sm font-medium">{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
        <div className="" aria-label="Settings">
          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Settings
          </div>
          <SidebarMenu>
            {settingsGroup.map(item => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <NavLink
                    to={item.url}
                    className="flex items-center gap-2 px-2 py-1 w-full rounded hover:bg-muted"
                  >
                    <item.icon className="w-4 h-4" aria-hidden />
                    <span className="text-sm font-medium">{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
