import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role: 'admin' | 'user';
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (role === 'admin' && userRole !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  if (role === 'user' && userRole === 'admin') {
    return <Navigate to="/admin" />;
  }

  return <>{children}</>;
}