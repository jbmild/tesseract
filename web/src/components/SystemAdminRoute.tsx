import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface SystemAdminRouteProps {
  children: React.ReactNode;
}

/**
 * Route protection component that only allows systemadmin users to access the route
 */
export default function SystemAdminRoute({ children }: SystemAdminRouteProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.role || user.role.name.toLowerCase() !== 'systemadmin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
