import React from 'react';
import { useParams, useLocation } from 'react-router-dom';

import {
  Box,
  Paper,
  Divider,
  Container,
  Typography,
} from '@mui/material';

import type { DoctorProps } from '../doctor-table-row';

export function DoctorViewID() {

  const location = useLocation();
  const doctor = location.state as DoctorProps;

  if (!doctor) {
    return (
      <Container sx={{ mt: 8 }}>
        <Typography variant="h6" color="error" align="center">
          doctor data not found.
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 8 }}>
      <Box
        display="flex"
        flexDirection={{ xs: 'column', md: 'row' }}
        gap={4}
        alignItems="flex-start"
        justifyContent="center"
      >
        {/* Details Section */}
        <Box flex={1} maxWidth={{ xs: '100%', md: '600px' }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              Doctor Details
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Box display="flex" flexDirection="column" gap={2}>
              <DetailItem label="Name" value={doctor.name} />
              <DetailItem label="Email" value={doctor.email} />
              <DetailItem label="Phone" value={doctor.phone} />
              
              <DetailItem
                label="Verified"
                value={doctor.isActive ? '✅ Yes' : '❌ No'}
              />
            </Box>
          </Paper>
        </Box>

        {/* Image Section */}
        <Box flex={1} maxWidth={{ xs: '100%', md: '600px' }}>
          <Box
            component="img"
            src="/assets/images/page-image/doctorVisitBG.png"
            alt="doctor"
            sx={{
              width: '100%',
              height: 'auto',
              borderRadius: 2,
              boxShadow: 3,
            }}
          />
        </Box>
      </Box>
    </Container>
  );
}

function DetailItem({ label, value }: { label: string; value?: string }) {
  return (
    <Box >
      <Typography variant="body1" color="text.secondary" display='flex' gap='10px'>
        <span style={{ fontWeight: 'bold', color: '#000' }}> {label}: </span>  <span style={{ fontWeight: 'bold' }}>{value || '—'}</span>
      </Typography>
    </Box>
  );
}
