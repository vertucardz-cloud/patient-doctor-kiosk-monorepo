/* eslint-disable import/no-unresolved */
import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { RoleBasedRoute } from 'src/routes/access/RoleBasedRoute';

import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';
import { PrivateRoute } from 'src/layouts/Private/private-route';
// ----------------------------------------------------------------------

export const DashboardPage = lazy(() => import('src/pages/dashboard'));
export const UserPage = lazy(() => import('src/pages/user'));
// eslint-disable-next-line import/no-unresolved
export const UserDetailsPageID = lazy(() => import('src/pages/[_id]/user-detailspage[_id]'));
export const FranchisePage = lazy(() => import('src/pages/create-franchise'));
export const FranchiseDetailsPageID = lazy(() => import('src/pages/[_id]/franchise-detailsPage[_id]'));
export const DoctorPage = lazy(() => import('src/pages/create-doctor'));
export const DoctorDetailsPageID = lazy(() => import('src/pages/[_id]/doctor-detailspage[_id]'));
export const PatientPage = lazy(() => import('src/pages/get-patient'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const RegisterPage = lazy(() => import('src/pages/register'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));
export const PatientCreatePage = lazy(() => import('src/public/patient-Create-Form'));
export const PatientDetailsPageID = lazy(() => import('src/pages/[_id]/patient-detailspage[_id]'));
// Update the import path to the correct file location and name
export const UserProfile = lazy(()=> import('src/pages/user-profile'));
export const CaseDetailsPageID = lazy(() => import('src/pages/[_id]/case-detailspage[_id]'));

const renderFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flex: '1 1 auto',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export const routesSection: RouteObject[] = [
  {
    element: (
      <PrivateRoute>
        <DashboardLayout>
          <Suspense fallback={renderFallback()}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <RoleBasedRoute allowedRoles={['admin']}>
            <DashboardPage />
          </RoleBasedRoute>
        ),
      },

      {
        path: 'user',
        element: (
          <RoleBasedRoute allowedRoles={['admin']}>
            <UserPage />
          </RoleBasedRoute>
        ),
      },
      {
        path: 'user/:id',
        element: (
          <RoleBasedRoute allowedRoles={['admin']}>
            <UserDetailsPageID />
          </RoleBasedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <RoleBasedRoute allowedRoles={['admin', 'doctor', 'user']}>
            <UserProfile />
          </RoleBasedRoute>
        ),
      },
      {
        path: 'franchise',
        element: (
          <RoleBasedRoute allowedRoles={['admin']}>
            <FranchisePage />
          </RoleBasedRoute>
        ),
      },
      {
        path: 'franchise/:id',
        element: (
          <RoleBasedRoute allowedRoles={['admin']}>
            <FranchiseDetailsPageID />
          </RoleBasedRoute>
        ),
      },

      {
        path: 'doctor/:id',
        element: (
          <RoleBasedRoute allowedRoles={['doctor', 'admin']}>
            <DoctorDetailsPageID />
          </RoleBasedRoute>
        ),
      },

      {
        path: 'doctor',
        element: (
          <RoleBasedRoute allowedRoles={['admin']}>
            <DoctorPage />
          </RoleBasedRoute>
        ),
      },

      { path: 'patient', element: <PatientPage /> },

      {
        path: 'patient/:id',
        element: (
          <RoleBasedRoute allowedRoles={['admin']}>
            <PatientDetailsPageID />
          </RoleBasedRoute>
        ),
      },

      { path: 'case', element: <PatientPage /> },
      {
        path: 'case/:caseId',
        element: (
          <RoleBasedRoute allowedRoles={['admin', 'doctor']}>
            <CaseDetailsPageID />
          </RoleBasedRoute>
        ),
      },

    ],
  },
  {
    path: 'patient/update-info/:patientId/:caseId',
    element: <PatientCreatePage />,
  },
  {
    path: 'sign-in',
    element: (
      <AuthLayout>
        <SignInPage />
      </AuthLayout>
    ),
  },
  {
    path: 'register',
    element: (
      <AuthLayout>
        <RegisterPage />
      </AuthLayout>
    ),
  },
  {
    path: '404',
    element: <Page404 />,
  },
  { path: '*', element: <Page404 /> },
];