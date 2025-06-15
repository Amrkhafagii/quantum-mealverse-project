
/**
 * == Sidebar Component Migration Guide (Phase 10) ==
 *
 * This index re-exports all the core sidebar primitives.
 *
 * [Migration Steps]
 * 1. Import sidebar components directly from this barrel file:
 *    import {
 *      SidebarProvider,
 *      Sidebar,
 *      SidebarTrigger,
 *      SidebarContent,
 *      SidebarMenu,
 *      SidebarMenuItem,
 *      SidebarMenuButton,
 *    } from "@/components/ui/sidebar";
 *
 * 2. **Animation and Transition**
 *    Animations for open/collapse and menu highlights are built-in using Tailwind.
 *    Add any additional transition classes to 'Sidebar' and 'SidebarMenuButton'.
 *
 * 3. **Drag-and-Drop**
 *    To implement drag-and-drop, manage your menu config/order in state and handle
 *    drag events at the SidebarMenuItem/MenuButton level.
 *
 * 4. **Search/Filter**
 *    Wrap SidebarMenu in a parent component with search/filter logic. Use `.filter`
 *    on your menu data before mapping to menu items.
 *
 * 5. **Routing Integration**
 *    For navigation, use <NavLink> or <Link> from "react-router-dom" inside SidebarMenuButton
 *    with 'asChild={true}'. See code example below:
 *      <SidebarMenuButton asChild>
 *        <NavLink to="/dashboard" className={...} />
 *      </SidebarMenuButton>
 *
 * 6. **Sidebar Templates**
 *    For common layouts, wrap groups of menu sections in your own component or as
 *    shown in the official docs.
 *
 * 7. **Removing Deprecated Patterns**
 *    - Stop importing non-existent legacy SidebarGroup, SidebarGroupContent, SidebarGroupLabel.
 *    - Use only components re-exported here for sidebar construction.
 */

export * from "./SidebarProvider";
export * from "./SidebarCore";
export * from "./SidebarContent";
export * from "./SidebarMenu";
export * from "./types";
export * from "./hooks";
export * from "./useSidebarState";
export * from "./constants";
