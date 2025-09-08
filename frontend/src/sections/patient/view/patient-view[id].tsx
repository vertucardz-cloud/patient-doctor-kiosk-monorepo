import { useState, useEffect } from 'react';
import { useLocation , useNavigate } from 'react-router-dom';
import {
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Legend,
  BarChart,
  PieChart,
  ResponsiveContainer,
  Tooltip as ReTooltip,
} from 'recharts';

import {
  Box,
  Tab,
  Grid,
  Card,
  Chip,
  Tabs,
  Stack,
  Table,
  Avatar,
  Divider,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  Container,
  Typography,
  CardContent,
} from '@mui/material';

import PatientService from 'src/services/patient/patient.service';

import type { PatientProps } from '../patient-table-row';

interface PatientCase {
  id: string;
  description: string;
  status: "Completed" | "Ongoing" | "Pending";
  date: string; // ISO date format (YYYY-MM-DD)
  cost: number;
}

interface MedicalHistory {
  id: string;
  condition: string;
  treatment: string;
  date: string;
}

interface IPatient {
  id: string,
  firstname: string;
  lastname: string;
  fullname: string;
  age: number;
  franchiseId: string;
  gender: string;
  dob: string;
  address: string;
  email: string;
  phone: string;
  status: string;
  updatedAt: string | Date;
  createdAt: string | Date;
  cases: PatientCase[];
  medicalHistory: MedicalHistory[];
}

const patientExampe = {
  name: 'John Doe',
  gender: 'Male',
  dob: '1990-04-15',
  address: '123 Main Street, New York',
  email: 'john.doe@email.com',
  phone: '+1 555-123-4567',
  status: 'Active',
  createdAt: '2024-05-01',
  cases: [
    { id: 'C-101', description: 'Tooth extraction', status: 'Completed', date: '2024-07-01', cost: 120 },
    { id: 'C-102', description: 'Root canal treatment', status: 'Ongoing', date: '2024-08-15', cost: 300 },
    { id: 'C-103', description: 'Teeth cleaning', status: 'Completed', date: '2024-09-10', cost: 80 },
  ],
  medicalHistory: [
    { id: 'M-01', condition: 'Diabetes', treatment: 'Insulin', date: '2023-05-21' },
    { id: 'M-02', condition: 'Hypertension', treatment: 'Amlodipine', date: '2022-11-10' },
  ],
};

// Chart colors
const COLORS = ['#4caf50', '#ff9800', '#2196f3'];

export function PatientViewID() {
  const [tab, setTab] = useState(0);
  const [patient, setPatient] = useState<Partial<IPatient>>({});

  const location = useLocation();
  const pt = location.state as PatientProps;
  const navigate = useNavigate();

  useEffect(() => {
    if (!pt) return;
    const patientDetails = async () => {
      try {
        // Assuming pt has an id property
        const fetched: Partial<IPatient> | null = await PatientService.getPatientById(pt.id);
        if (fetched) {
          // Map/transform fetched data to match IPatient interface if necessary
          // const patientFetched: IPatient = {
          //   name: fetched.name ?? '',
          //   gender: fetched.gender ?? 'Other',
          //   dob: fetched.dob ?? '',
          //   address: fetched.address ?? '',
          //   email: fetched.email ?? '',
          //   phone: fetched.phone ?? '',
          //   status: fetched.status ?? 'Inactive',
          //   createdAt: fetched.createdAt ?? '',
          //   cases: fetched.cases ?? [],
          //   medicalHistory: fetched.medicalHistory ?? [],
          // };
          setPatient(fetched);
        }
        console.log('--------patientFetched----------', fetched);
      } catch (e) {
        console.log('-------------error-----------', e);
      }
    };
    patientDetails();
  }, [pt]);

  if (!pt) {
    return (
      <Container sx={{ mt: 8 }}>
        <Typography variant="h6" color="error" align="center">
          Patient Id not found.
        </Typography>
      </Container>
    );
  }

  // Calculate Age
  const age = Math.floor((new Date().getTime() - new Date(patient.dob as string).getTime()) / (1000 * 60 * 60 * 24 * 365));

  // Data for PieChart (status distribution)
  const statusData = [
    { name: 'Completed', value: patient?.cases?.filter((c) => c.status === 'Completed').length },
    { name: 'Ongoing', value: patient?.cases?.filter((c) => c.status === 'Ongoing').length },
    { name: 'Pending', value: patient?.cases?.filter((c) => c.status === 'Pending').length },
  ];


  const handleRowClick = (row: PatientCase) => {
    console.log('----------row case -------------------', row)
    const caseId = row.id;
    navigate(`/case/${caseId}`, { state: row });
  };

  return (
    <Box p={3}>
      {/* Patient Header */}
      <Card
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Avatar Section */}
          <Grid>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 80,
                height: 80,
                fontSize: 30,
                boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
              }}
            >
              {patient?.fullname?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </Avatar>
          </Grid>

          {/* Info Section */}
          <Grid>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              {patient.fullname}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              sx={{ color: 'text.secondary', fontSize: 14 }}
            >
              <Typography>{patient.email}</Typography>
              <Divider orientation="vertical" flexItem />
              <Typography>{patient.phone}</Typography>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              sx={{ color: 'text.secondary', fontSize: 14, mt: 0.5 }}
            >
              <Typography>{patient.gender}</Typography>
              <Divider orientation="vertical" flexItem />
              <Typography>{patient.age} years</Typography>
              <Divider orientation="vertical" flexItem />
              <Typography>{patient.address}</Typography>
            </Stack>

            <Chip
              label={patient.status}
              color={patient.status === 'Active' ? 'success' : 'default'}
              size="small"
              sx={{ mt: 1.5, fontWeight: 500 }}
            />
          </Grid>
        </Grid>
      </Card>


      {/* Tabs */}
      <Card>
        <Tabs
          value={tab}
          onChange={(_, newValue) => setTab(newValue)}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Cases" />
          <Tab label="Treatment Plan" />
          <Tab label="Medical History" />
          <Tab label="Payment History" />
        </Tabs>
        <Divider />

        {/* Cases Tab */}
        {tab === 0 && (
          <CardContent>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell >ID</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Cost (₹)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {patient?.cases?.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell 
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      cursor: "pointer",
                      color: "primary.main",
                      textDecoration: "underline",
                      fontWeight: 500,
                    }}
                    onClick={() => handleRowClick(c)} 
                    >
                      {c.id}
                    </TableCell>
                    <TableCell>{c.description}</TableCell>
                    <TableCell>
                      <Chip
                        label={c.status}
                        color={c.status === 'Completed' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{c.date}</TableCell>
                    <TableCell>{c.cost}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        )}

        {/* Medical History Tab */}
        {tab === 1 && (
          <CardContent>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Condition</TableCell>
                  <TableCell>Treatment</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {patient?.medicalHistory?.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{m.id}</TableCell>
                    <TableCell>{m.condition}</TableCell>
                    <TableCell>{m.treatment}</TableCell>
                    <TableCell>{m.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>

      <Grid container spacing={3} mt={1} >
        {/* Bar Chart - Costs */}

        <Card sx={{

          height: 350,
          width: "100%",
          maxWidth: 500,

        }}>
          <Typography variant="h6" mb={2}>
            Case Costs Overview
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={patient.cases}>
              <XAxis dataKey="date" />
              <YAxis />
              <ReTooltip />
              <Legend />
              <Bar dataKey="cost" fill="#1976d2" name="Treatment Cost" />
            </BarChart>
          </ResponsiveContainer>
        </Card>


        {/* Pie Chart - Status */}

        <Card sx={{


          height: 350,
          width: "100%",
          maxWidth: 500,

        }}>
          <Typography variant="h6" mb={2}>
            Case Status Distribution
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                label
              >
                {statusData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <ReTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

      </Grid>

    </Box>
  );
}
