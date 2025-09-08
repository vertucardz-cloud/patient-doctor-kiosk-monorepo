import type { ReactNode } from 'react';

import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../auth/AuthContext';

type PrivateRouteProps = {
  children: ReactNode;
};

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
