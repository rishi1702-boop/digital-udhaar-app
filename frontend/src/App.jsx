import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import CashbookPage from './pages/CashbookPage';
import RemindersPage from './pages/RemindersPage';
import SettingsPage from './pages/SettingsPage';
import HomePage from './pages/HomePage';
import PaymentCheckoutPage from './pages/PaymentCheckoutPage';
import NotFoundPage from './pages/NotFoundPage';
import Loader from './components/Common/Loader';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader fullPage />;
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader fullPage />;
  return user ? <Navigate to="/dashboard" /> : children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
    <Route path="/checkout/:customerId" element={<PaymentCheckoutPage />} />
    <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="customers" element={<CustomersPage />} />
      <Route path="customers/:id" element={<CustomerDetailPage />} />
      <Route path="cashbook" element={<CashbookPage />} />
      <Route path="reminders" element={<RemindersPage />} />
      <Route path="settings" element={<SettingsPage />} />
    </Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <AppRoutes />
          <ToastContainer position="top-right" autoClose={3000} theme="dark"
            toastStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }} />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
