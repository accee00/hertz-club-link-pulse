import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute.jsx';
import { DashboardPage } from './features/auth/pages/DashboardPage.jsx';
import { LoginPage } from './features/auth/pages/LoginPage.jsx';
import { RegisterPage } from './features/auth/pages/RegisterPage.jsx';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;