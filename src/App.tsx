import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Layout from "@/components/Layout";
import AdminLayout from "@/components/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import About from "./pages/About";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Contact from "./pages/Contact";
import Services from "./pages/Services";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import PendingApproval from "./pages/PendingApproval";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminManagement from "./pages/admin/AdminManagement";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
          <AppProvider>
            <Routes>
              {/* Auth routes */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/pending-approval" element={<PendingApproval />} />

              {/* Admin routes */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={["approved_admin", "super_admin"]}><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/products" element={<ProtectedRoute allowedRoles={["approved_admin", "super_admin"]}><AdminLayout><AdminProducts /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={["approved_admin", "super_admin"]}><AdminLayout><AdminOrders /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/messages" element={<ProtectedRoute allowedRoles={["approved_admin", "super_admin"]}><AdminLayout><AdminMessages /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={["approved_admin", "super_admin"]}><AdminLayout><AdminNotifications /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/admins" element={<ProtectedRoute allowedRoles={["super_admin"]}><AdminLayout><AdminManagement /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={["approved_admin", "super_admin"]}><AdminLayout><AdminSettings /></AdminLayout></ProtectedRoute>} />

              {/* Customer routes */}
              <Route path="/" element={<Layout><About /></Layout>} />
              <Route path="/shop" element={<Layout><Shop /></Layout>} />
              <Route path="/shop/:id" element={<Layout><ProductDetail /></Layout>} />
              <Route path="/cart" element={<Layout><Cart /></Layout>} />
              <Route path="/services" element={<Layout><Services /></Layout>} />
              <Route path="/contact" element={<Layout><Contact /></Layout>} />
              <Route path="/notifications" element={<Layout><Notifications /></Layout>} />
              <Route path="/profile" element={<Layout><Profile /></Layout>} />

              <Route path="*" element={<Layout><NotFound /></Layout>} />
            </Routes>
          </AppProvider>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
