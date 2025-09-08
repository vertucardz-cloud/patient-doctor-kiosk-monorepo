import React from "react";
import ReactDOM from "react-dom/client";
import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";

import App from "./app";
import { routesSection } from "./routes/sections";
import { ErrorBoundary } from "./routes/components";
import { AuthProvider } from "./layouts/auth/AuthContext";

const theme = createTheme();

const router = createBrowserRouter([
  {
    element: (
      <App>
        <Outlet />
      </App>
    ),
    errorElement: <ErrorBoundary />,
    children: routesSection,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ThemeProvider>
    </LocalizationProvider>
  </React.StrictMode>
);
