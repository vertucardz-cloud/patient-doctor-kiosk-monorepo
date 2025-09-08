import { useRef } from "react";
import { Icon } from "@iconify/react";
import { useParams, useLocation } from "react-router-dom";
import {
  Line,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import {
  Box,
  Grid,
  Chip,
  Paper,
  Stack,
  Rating,
  Button,
  Avatar,
  Divider,
  Container,
  Typography,
} from "@mui/material";

import type { FranchiseProps } from "../franchise-table-row";

export function FranchiseViewID() {
  const { id } = useParams();
 const qrRef = useRef<HTMLDivElement>(null) ;
  const location = useLocation();
  const franchise = location.state as FranchiseProps;
  const matchedQrCodes = franchise?.qrCodes?.filter(
    (qr) => qr.franchiseId === id
  );


  const handleDownloadQr = () => {
    const img = qrRef.current?.querySelector("img") as HTMLImageElement | null;
    if (!img) return;

    const link = document.createElement("a");
    link.href = img.src;
    link.download = "qrcode.png";
    link.click();

 
  };


  const handlePrintQr = () => {
    const img = qrRef.current?.querySelector("img") as HTMLImageElement | null;
    if (!img) return;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(`
      <html>
        <head>
          <title>Print QR</title>
          <style>
            @media print {
              body {
                background: #f0f4ff !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
            body {
              margin: 0;
              height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              background: #f0f4ff; 
            }
            img {
              width: 250px;
              height: 250px;
              padding: 12px;
              background: white;
            }
          </style>
        </head>
        <body>
          <img src="${img.src}" alt="QR Code" />
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); }
            }
          </script>
        </body>
      </html>
    `);
      win.document.close();
    }
  };



  const visitData = [
    { time: "10 AM", visits: 30 },
    { time: "11 AM", visits: 50 },
    { time: "12 PM", visits: 80 },
    { time: "1 PM", visits: 40 },
    { time: "2 PM", visits: 100 },
    { time: "3 PM", visits: 60 },
    { time: "4 PM", visits: 90 },
    { time: "5 PM", visits: 70 },
    { time: "6 PM", visits: 110 },
    { time: "7 PM", visits: 80 },
    { time: "8 PM", visits: 120 },
    { time: "9 PM", visits: 90 },
    { time: "10 PM", visits: 130 },
    { time: "11 PM", visits: 100 },
  ];

  if (!franchise) {
    return (
      <Container sx={{ mt: 8 }}>
        <Typography variant="h6" color="error" align="center">
          Franchise data not found.
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 6, mb: 10 }}>
      <Grid container spacing={4} alignItems="stretch">
        {/* Left: Franchise Image */}
        <Grid>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              borderRadius: 3,
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            {matchedQrCodes?.length ? (
              <div ref={qrRef}>
                <img
                src={matchedQrCodes[0].qrImageUrl}
                alt="Franchise QR"
              />
              </div>
            ) : (
              <Typography>No QR Code Found</Typography>
            )}
        
             <Stack direction="row" spacing={2} sx={{ mt: 2 }} justifyContent="center">
            <Button
              variant="contained"
              onClick={handleDownloadQr}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
                background: "linear-gradient(to right, #6504C5, #4f46e5)",
                "&:hover": {
                  background: "linear-gradient(to right, #2563eb, #4338ca)",
                },
              }}
            >
              ⬇ Download
            </Button>

            <Button
              variant="outlined"
              onClick={handlePrintQr}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              🖨 Print
            </Button>
          </Stack>


          </Paper>

         
        </Grid>

        {/* Right: Details Section */}
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
              {franchise.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Franchise Information
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box display="flex" flexDirection="column" gap={2}>
              <DetailItem icon="solar:letter-bold-duotone" label="Email" value={franchise.email} />
              <DetailItem icon="solar:phone-bold-duotone" label="Phone" value={franchise.phone} />
              <DetailItem icon="solar:map-point-bold-duotone" label="Address" value={franchise.address} />
              <DetailItem icon="solar:city-bold-duotone" label="City" value={franchise.city} />
              <DetailItem icon="solar:map-bold-duotone" label="State" value={franchise.state} />
              <DetailItem icon="solar:flag-bold-duotone" label="Country" value={franchise.country} />

              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <Icon icon="solar:shield-check-bold-duotone" width={22} />
                <Typography variant="subtitle1" fontWeight={600}>
                  Status:
                </Typography>
                <Chip
                  label={franchise.isActive ? "Active" : "Inactive"}
                  color={franchise.isActive ? "success" : "error"}
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </Box>

            </Box>
          </Paper>
        </Grid>


        <Grid>
          {/* Live Customer Visits Chart */}
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Live Customer Visits
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={visitData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="visits" stroke="#1976d2" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>

      {/* Reviews Section */}
      <Box mt={8}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Rating & Reviews
        </Typography>

        <Grid container spacing={4} alignItems="center">
          {/* Rating Summary */}
          <Grid>
            <Typography variant="h3" fontWeight={700}>
              4.5
              <Typography component="span" variant="h6" color="text.secondary">
                {" "} / 5
              </Typography>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              (50 New Reviews)
            </Typography>
            <Rating value={4.5} precision={0.5} readOnly size="large" />
          </Grid>

          {/* Single Review Example */}
          <Grid>
            <Paper
              elevation={2}
              sx={{ p: 3, borderRadius: 2, display: "flex", flexDirection: "column", gap: 2 }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar src="/assets/images/avatar.png" />
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Alex Mathio
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    13 Oct 2024
                  </Typography>
                </Box>
              </Box>
              <Rating value={5} readOnly size="small" />
              <Typography variant="body2" color="text.secondary">
                This franchise delivers excellent service and support. Very professional and reliable.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
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
