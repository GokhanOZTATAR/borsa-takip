import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, AuthProvider, DataProvider, useAuth } from './context';
import Layout from './components/layout/Layout';

import PinScreen from './pages/PinScreen';
import Dashboard from './pages/Dashboard';
import LivePnL from './pages/LivePnL';
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import StockAnalysis from './pages/StockAnalysis';
import Movements from './pages/Movements';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isPinEnabled, isLoading } = useAuth();
  if (isLoading) return <div className="flex h-screen items-center justify-center">Yükleniyor...</div>;
  if (isPinEnabled && !isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PinScreen />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="live" element={<LivePnL />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="stocks" element={<StockAnalysis />} />
        <Route path="movements" element={<Movements />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <HashRouter>
            <AppRoutes />
          </HashRouter>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
