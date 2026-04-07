import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/primitives";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ActiveUnitProvider } from "@/contexts/ActiveUnitContext";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import Login from "./pages/Login";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import SettingsPage from "./pages/dashboard/SettingsPage";
import ComponentsShowcase from "./pages/dashboard/ComponentsShowcase";
import ComponentsShowcaseTwo from "./pages/dashboard/ComponentsShowcaseTwo";
import ComponentsShowcaseThree from "./pages/dashboard/ComponentsShowcaseThree";
import ComponentsShowcaseFour from "./pages/dashboard/ComponentsShowcaseFour";
import ComponentsShowcaseFive from "./pages/dashboard/ComponentsShowcaseFive";
import TypographyShowcase from "./pages/dashboard/TypographyShowcase";
import ReservationsPage from "./pages/dashboard/ReservationsPage";
import AdminUnitsPage from "./pages/dashboard/AdminUnitsPage";
import AdminAddUnitPage from "./pages/dashboard/AdminAddUnitPage";
import AdminAddSingleUnitPage from "./pages/dashboard/AdminAddSingleUnitPage";
import AdminAddBatchUnitPage from "./pages/dashboard/AdminAddBatchUnitPage";
import AdminMachinesPage from "./pages/dashboard/AdminMachinesPage";
import AdminMachinePairsPage from "./pages/dashboard/AdminMachinePairsPage";
import AdminOpsDashboardPage from "./pages/dashboard/AdminOpsDashboardPage";
import AdminIncidentsPage from "./pages/dashboard/AdminIncidentsPage";
import AdminBillingPage from "./pages/dashboard/AdminBillingPage";
import AdminSystemSettingsPage from "./pages/dashboard/AdminSystemSettingsPage";
import AdminUsersPage from "./pages/dashboard/AdminUsersPage";
import AdminUserFormPage from "./pages/dashboard/AdminUserFormPage";
import AdminManageUnitLinksPage from "./pages/dashboard/AdminManageUnitLinksPage";
import UserProfilePage from "./pages/dashboard/UserProfilePage";
import NotFoundPage from "./pages/404";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetAccountByPinPage from "./pages/ResetAccountByPinPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, mustChangePassword } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (mustChangePassword) return <Navigate to="/trocar-senha" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, mustChangePassword } = useAuth();
  if (isAuthenticated) return <Navigate to={mustChangePassword ? "/trocar-senha" : "/dashboard"} replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  if (profile?.role !== "ADMIN" && profile?.role !== "SUPER") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="template-theme">
    <TooltipProvider>
      <Sonner />
      <AuthProvider>
        <ActiveUnitProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/esqueci-senha" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
              <Route path="/resgatar-conta" element={<PublicRoute><ResetAccountByPinPage /></PublicRoute>} />
              <Route path="/trocar-senha" element={<ChangePasswordPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardHome />} />
                <Route path="componentes" element={<Navigate to="/dashboard/componentes-1" replace />} />
                <Route path="componentes-1" element={<ComponentsShowcase />} />
                <Route path="componentes-2" element={<ComponentsShowcaseTwo />} />
                <Route path="componentes-3" element={<ComponentsShowcaseThree />} />
                <Route path="componentes-4" element={<ComponentsShowcaseFour />} />
                <Route path="componentes-5" element={<ComponentsShowcaseFive />} />
                <Route path="tipografia" element={<TypographyShowcase />} />
                <Route path="reservas" element={<ReservationsPage />} />
                <Route path="admin/unidades" element={<AdminRoute><AdminUnitsPage /></AdminRoute>} />
                <Route path="admin/unidades/:id/gerenciar" element={<AdminRoute><AdminManageUnitLinksPage /></AdminRoute>} />
                <Route path="admin/unidades/adicionar" element={<AdminRoute><AdminAddUnitPage /></AdminRoute>} />
                <Route path="admin/unidades/adicionar/uma" element={<AdminRoute><AdminAddSingleUnitPage /></AdminRoute>} />
                <Route path="admin/unidades/adicionar/lote" element={<AdminRoute><AdminAddBatchUnitPage /></AdminRoute>} />
                <Route path="admin/maquinas" element={<AdminRoute><AdminMachinesPage /></AdminRoute>} />
                <Route path="admin/pares" element={<AdminRoute><AdminMachinePairsPage /></AdminRoute>} />
                <Route path="admin/usuarios" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
                <Route path="admin/usuarios/novo" element={<AdminRoute><AdminUserFormPage /></AdminRoute>} />
                <Route path="admin/usuarios/:id/editar" element={<AdminRoute><AdminUserFormPage /></AdminRoute>} />
                <Route path="admin/dashboard" element={<AdminRoute><AdminOpsDashboardPage /></AdminRoute>} />
                <Route path="admin/ocorrencias" element={<AdminRoute><AdminIncidentsPage /></AdminRoute>} />
                <Route path="admin/faturamento" element={<AdminRoute><AdminBillingPage /></AdminRoute>} />
                <Route path="admin/sistema" element={<AdminRoute><AdminSystemSettingsPage /></AdminRoute>} />
                <Route path="perfil" element={<UserProfilePage />} />
                <Route path="configuracoes" element={<SettingsPage />} />
                <Route path="404" element={<NotFoundPage />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </ActiveUnitProvider>
      </AuthProvider>
    </TooltipProvider>
  </ThemeProvider>
);

export default App;
