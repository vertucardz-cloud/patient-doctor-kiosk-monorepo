import { Icon } from "@iconify/react";
import { useLocation } from "react-router-dom";

import {
  Box,
  Grid,
  Chip,
  Paper,
  Avatar,
  Divider,
  Container,
  Typography,
} from "@mui/material";

import type { UserProps } from "../history-table-row";

export function UserViewID() {
  const location = useLocation();
  const user = location.state as UserProps;
  if (!user) {
    return (
      <Container sx={{ mt: 8 }}>
        <Typography variant="h6" color="error" align="center">
          User data not found.
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 6, mb: 10 }}>
      {/* <Grid container spacing={4} alignItems="stretch"> */}
        <Grid>
          <Paper
            elevation={4}
            sx={{
              p: 4,
              borderRadius: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {user?.username?.charAt(0).toUpperCase() + user?.username?.slice(1)}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              User Information
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box display="flex" flexDirection="column" gap={2}>
              <DetailItem icon="solar:letter-bold-duotone" label="Email" value={user.email} />

              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <Icon icon="solar:shield-check-bold-duotone" width={22} />
                <Typography variant="subtitle1" fontWeight={600}>
                  Status:
                </Typography>
                <Chip
                  label={user.isVerified ? "Active" : "Inactive"}
                  color={user.isVerified ? "success" : "error"}
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </Box>

            </Box>
          </Paper>
        </Grid>
    </Container>
  );
}

// Reusable Detail Item with icon + label + value
function DetailItem({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value?: string;
}) {
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Icon icon={icon} width={22} style={{ color: "#555" }} />
      <Typography variant="subtitle1" fontWeight={600} sx={{ minWidth: 90 }}>
        {label}:
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 500, color: "text.primary" }}>
        {value || "—"}
      </Typography>
    </Box>
  );
}
