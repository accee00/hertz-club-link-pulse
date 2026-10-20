import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute.jsx";
import { LandingPage } from "./features/auth/pages/LandingPage.jsx";
import { LoginPage } from "./features/auth/pages/LoginPage.jsx";
import { RegisterPage } from "./features/auth/pages/RegisterPage.jsx";
import { DashboardPage } from "./features/link-pulse/pages/DashboardPage.jsx";

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
      <Route path="/" element={<LandingPage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
