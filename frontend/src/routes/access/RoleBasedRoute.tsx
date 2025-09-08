import type { ReactNode } from 'react';

import { Navigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { useAuth } from 'src/layouts/auth/AuthContext';

interface RoleBasedRouteProps {
  allowedRoles: ('admin' | 'doctor'| 'user' | 'support')[];
  children: ReactNode;
}

export function RoleBasedRoute({ allowedRoles, children }: RoleBasedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return null; // or spinner

  if (!isAuthenticated || !user) {
    return <Navigate to="/sign-in" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          bgcolor: 'background.default',
        }}
      >
        <LockOutlinedIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6">Access Denied</Typography>
        <Typography variant="body2" color="text.secondary">
          You don’t have permission to view this page.
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
}
