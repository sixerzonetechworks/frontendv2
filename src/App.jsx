/**
 * Main Application Component
 *
 * Handles routing between customer booking and admin panel
 */

import { Routes, Route } from "react-router-dom";
import CustomerBooking from "./components/CustomerBooking";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsAndConditions from "./components/TermsAndConditions";
import ContactUs from "./components/ContactUs";
import RefundPolicy from "./components/RefundPolicy";
import Footer from "./components/Footer";
import "./App.css";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<CustomerBooking />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Legal & Contact Pages */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
