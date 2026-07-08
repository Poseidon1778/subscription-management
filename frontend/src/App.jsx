import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Plans from "./pages/Plans";
import Subscriptions from "./pages/Subscriptions";
import SubscriptionDetail from "./pages/SubscriptionDetail";
import Invoices from "./pages/Invoices";
import InvoiceDetail from "./pages/InvoiceDetail";
import Payments from "./pages/Payments";
import Discounts from "./pages/Discounts";
import Taxes from "./pages/Taxes";
import Users from "./pages/Users";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/subscriptions/:id" element={<SubscriptionDetail />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/invoices/:id" element={<InvoiceDetail />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/discounts" element={<Discounts />} />
            <Route path="/taxes" element={<Taxes />} />
            <Route path="/users" element={<Users />} />
            {/* More module routes will be added here as we build them */}
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;







