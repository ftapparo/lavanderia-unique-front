import { LayoutDashboard, Settings, Component, Shapes, Table2, BellRing, CalendarClock, Type, CircleAlert } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import BrandLogo from "@/components/BrandLogo";
import ThemeSwitcher from "@/components/theme/ThemeSwitcher";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/primitives";

const menuItems = [
  { title: "Visao Geral", url: "/dashboard", icon: LayoutDashboard },
  { title: "Componentes 1", url: "/dashboard/componentes-1", icon: Component },
  { title: "Componentes 2", url: "/dashboard/componentes-2", icon: Shapes },
  { title: "Componentes 3", url: "/dashboard/componentes-3", icon: Table2 },
  { title: "Componentes 4", url: "/dashboard/componentes-4", icon: BellRing },
  { title: "Componentes 5", url: "/dashboard/componentes-5", icon: CalendarClock },
  { title: "Tipografia", url: "/dashboard/tipografia", icon: Type },
  { title: "Configuracoes", url: "/dashboard/configuracoes", icon: Settings },
  { title: "404", url: "/dashboard/404", icon: CircleAlert },
];

export default function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      collapsible="icon"
      className={
        isCollapsed
          ? "[&_[data-sidebar=sidebar]]:bg-[var(--color-brand-primary)] [&_[data-sidebar=sidebar]]:text-primary-foreground [&_[data-sidebar=header]]:border-white/20 [&_[data-sidebar=footer]]:border-white/20"
          : undefined
      }
    >
      <SidebarHeader className="h-14 border-b border-sidebar-border p-0">
        <div className="flex h-full items-center justify-center px-2">
          <BrandLogo className="h-20 w-20" fallbackClassName="h-20 w-20" forceWhite={isCollapsed} />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className={`flex items-center gap-3 ${isCollapsed
                        ? "text-primary-foreground/90 hover:bg-primary-dark/40 hover:text-primary-foreground"
                        : ""
                        }`}
                      activeClassName={
                        isCollapsed
                          ? "bg-primary-dark/50 text-primary-foreground font-medium"
                          : "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      }
                    >
                      <item.icon className={`h-4 w-4 ${isCollapsed ? "text-primary-foreground" : ""}`} />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {!isCollapsed && (
          <div className="px-2 py-3">
            <div className="mb-2">
              <ThemeSwitcher />
            </div>
            <p className="typo-caption text-sidebar-foreground/50">Template Frontend v1.0</p>
          </div>
        )}
        {isCollapsed && (
          <div className="flex items-center justify-center py-2">
            <ThemeSwitcher compact />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
