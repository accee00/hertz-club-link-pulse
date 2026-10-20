import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hook/useAuth.js';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <main className="[display:grid] [min-height:100vh] [place-items:center] [color:var(--muted)]">Loading your account...</main>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export { ProtectedRoute };