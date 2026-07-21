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
import Chat from "./pages/Chat";
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
import MyOrders from "./pages/MyOrders";
import AccountSettings from "./pages/AccountSettings";
import Saved from "./pages/Saved";
import FAQ from "./pages/FAQ";
import ComingSoon from "./pages/ComingSoon";
import OrderDetail from "./pages/OrderDetail";
import CheckoutReturn from "./pages/CheckoutReturn";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <PaymentTestModeBanner />
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
              <Route path="/checkout/return" element={<Layout><CheckoutReturn /></Layout>} />
              <Route path="/services" element={<Layout><Services /></Layout>} />
              <Route path="/chat" element={<Layout><Chat /></Layout>} />
              <Route path="/contact" element={<Layout><Contact /></Layout>} />
              <Route path="/notifications" element={<Layout><Notifications /></Layout>} />
              <Route path="/profile" element={<Layout><Profile /></Layout>} />
              <Route path="/profile/orders" element={<Layout><MyOrders /></Layout>} />
              <Route path="/profile/orders/:id" element={<Layout><OrderDetail /></Layout>} />
              <Route path="/profile/settings" element={<Layout><AccountSettings /></Layout>} />
              <Route path="/profile/saved" element={<Layout><Saved /></Layout>} />
              <Route path="/profile/faq" element={<Layout><FAQ /></Layout>} />
              <Route path="/profile/quotes" element={<Layout><ComingSoon title="Quotes" description="Your quote requests will appear here. Request a new quote from the Services page." ctaLabel="Request a quote" ctaTo="/services" /></Layout>} />
              <Route path="/profile/service-requests" element={<Layout><ComingSoon title="Service Requests" description="Track your IT service bookings here. Start a new request from the Services page." ctaLabel="Book a service" ctaTo="/services" /></Layout>} />
              <Route path="/profile/billing" element={<Layout><ComingSoon title="Billing & Invoices" description="Invoices for your completed orders will be available here soon." ctaLabel="View orders" ctaTo="/profile/orders" /></Layout>} />

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
