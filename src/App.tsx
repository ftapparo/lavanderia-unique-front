import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/primitives";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
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
import NotFoundPage from "./pages/404";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="template-theme">
    <TooltipProvider>
      <Sonner />
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
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
              <Route path="configuracoes" element={<SettingsPage />} />
              <Route path="404" element={<NotFoundPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </ThemeProvider>
);

export default App;
