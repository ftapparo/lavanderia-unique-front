import { LayoutDashboard, Settings, CalendarClock, Building2, WashingMachine, Link2, Gauge, AlertTriangle, FileSpreadsheet, SlidersHorizontal, Users, TimerReset, ClipboardList } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import BrandLogo from "@/components/BrandLogo";
import ThemeSwitcher from "@/components/theme/ThemeSwitcher";
import { useAuth } from "@/contexts/AuthContext";
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

type NavItem = { title: string; url: string; icon: React.ElementType };

const menuItems: NavItem[] = [
  { title: "Visao Geral", url: "/dashboard", icon: LayoutDashboard },
  { title: "Reservas", url: "/dashboard/reservas", icon: CalendarClock },
  { title: "Configuracoes", url: "/dashboard/configuracoes", icon: Settings },
];

const adminOperationsItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard/admin/dashboard", icon: Gauge },
  { title: "Jobs", url: "/dashboard/admin/jobs", icon: TimerReset },
  { title: "Ocorrencias", url: "/dashboard/admin/ocorrencias", icon: AlertTriangle },
  { title: "Faturamento", url: "/dashboard/admin/faturamento", icon: FileSpreadsheet },
  { title: "Sistema", url: "/dashboard/admin/sistema", icon: SlidersHorizontal },
];

const adminPeopleItems: NavItem[] = [
  { title: "Usuarios", url: "/dashboard/admin/usuarios", icon: Users },
  { title: "Unidades", url: "/dashboard/admin/unidades", icon: Building2 },
];

const adminEquipmentItems: NavItem[] = [
  { title: "Maquinas", url: "/dashboard/admin/maquinas", icon: WashingMachine },
  { title: "Pares", url: "/dashboard/admin/pares", icon: Link2 },
  { title: "Informativos", url: "/dashboard/admin/informativos", icon: ClipboardList },
];

function NavItems({ items, isCollapsed }: { items: NavItem[]; isCollapsed: boolean }) {
  return (
    <>
      {items.map((item) => (
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
    </>
  );
}

export default function AppSidebar() {
  const { profile } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const isAdmin = profile?.role === "ADMIN" || profile?.role === "SUPER";

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
          <SidebarGroupLabel>Geral</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItems items={menuItems} isCollapsed={isCollapsed} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Gestao</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <NavItems items={adminOperationsItems} isCollapsed={isCollapsed} />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Usuarios e Unidades</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <NavItems items={adminPeopleItems} isCollapsed={isCollapsed} />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Maquinas</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <NavItems items={adminEquipmentItems} isCollapsed={isCollapsed} />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
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
