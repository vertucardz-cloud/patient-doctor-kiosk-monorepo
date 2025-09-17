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

import { dateFormat } from '../utils';

import type { PatientProps } from '../patient-table-row';






interface PatientCase {
  id: string;
  description: string;
  status: "Completed" | "Ongoing" | "Pending";
  date: string; // ISO date format (YYYY-MM-DD)
  cost: number;
}

// interface MedicalHistory {
//   id: string;
//   condition: string;
//   treatment: string;
//   date: string;
// }

// interface IPatient {
//   id: string,
//   firstname: string;
//   lastname: string;
//   fullname: string;
//   age: number;
//   franchiseId: string;
//   gender: string;
//   dob: string;
//   address: string;
//   email: string;
//   phone: string;
//   status: string;
//   updatedAt: string | Date;
//   createdAt: string | Date;
//   cases: PatientCase[];
//   medicalHistory: MedicalHistory[];
// }

export interface IPatient {
  id: string;
  firstname: string;
  lastname: string;
  fullname: string;
  phone: string;
  email: string;
  age: number;
  gender: string; 
  dob: string;
  status: string;
  address: string;
  franchiseId: string;
  updatedAt: string | Date;
  createdAt: string | Date;
  cases: Case[];
  medicalHistory: MedicalHistory[];
  messages: ChatMessage[];
}

export interface Case {
  id: string;
  qrCodeId: string;
  franchiseId: string;
  patientId: string;
  doctorId: string;
  description: string;
  status: "PENDING" | "ONGOING" | "COMPLETED" | "CANCELLED"| "Completed" | "Ongoing" | "Pending";
  doctorNotes: string | null;
  medicationCost: number | null;
  followUpDate: string | null; // ISO date string or null
  createdAt: string;
  updatedAt: string;
  date: string; // ISO date format (YYYY-MM-DD)
  cost: number;
  treatmentPlan: TreatmentPlan[];
}

export interface TreatmentPlan {
  id: string;
  caseId: string;
  doctorId: string;
  summary: string;
  medication: string;
  estimatedCost: number;
  status: "PENDING" | "ONGOING" | "COMPLETED" | "CANCELLED"| 'Ongoing'| 'Completed';
  createdAt: string;
  updatedAt: string;
  payments: Payment[];
}

export interface Payment {
  id: string;
  treatmentPlanId: string;
  amount: number;
  method: "CASH" | "CARD" | "UPI" | "BANK_TRANSFER";
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED"| 'Completed';
  transactionRef: string;
  paidAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalHistory {
  id: string;
  patientId: string;
  condition: string;
  diagnosis: string;
  treatment: string;
  notes: string;
  date: string;
  doctorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  messageId: string;
  from: string;
  to: string;
  profileName: string;
  contentType: string;   // e.g. "text/plain"
  messageType: string;   // e.g. "chat"
  body: string;
  franchiseId: string;
  patientId: string;
  caseId: string;
  location: string;
  createdAt: string;     // ISO date string
  updatedAt: string;     // ISO date string
}



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
    { name: 'Pending', value: patient?.cases?.filter((c) => c.status === 'Ongoing').length },
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
          <Tab label="Conversion History" />
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
                    // onClick={() => handleRowClick(c)} 
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
                    <TableCell>{dateFormat(m.date)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>

        {/* Treatment Plan */}
        {tab === 2 && (
          <CardContent>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell >ID</TableCell>
                  <TableCell>Doctor ID</TableCell>
                  <TableCell>Summary</TableCell>
                  <TableCell>Medication</TableCell>
                  <TableCell>EstimatedCost (₹)</TableCell>
                  <TableCell>CreatedAt</TableCell>
                  <TableCell>UpdatedAt</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Cost (₹)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {patient?.cases?.[0]?.treatmentPlan?.map((c: TreatmentPlan) => (
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
                    // onClick={() => handleRowClick(c)} 
                    >
                      {c.id}
                    </TableCell>
                    <TableCell>{c.doctorId}</TableCell>
                    <TableCell>{c.summary}</TableCell>
                    <TableCell>{c.medication}</TableCell>
                    <TableCell>{c.estimatedCost}</TableCell>
                    <TableCell>{dateFormat(c.createdAt)}</TableCell>
                    <TableCell>{dateFormat(c.updatedAt)}</TableCell>
                    <TableCell>
                      <Chip
                        label={c.status}
                        color={c.status === 'Completed' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    {/* <TableCell>{c.date}</TableCell>
                    <TableCell>{c.cost}</TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        )}
        {tab === 3 && (
          <CardContent>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell >ID</TableCell>
                  <TableCell>TreatmentPlanId</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Cost (₹)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {patient?.cases?.[0]?.treatmentPlan?.[0]?.payments?.map((c: Payment) => (
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
                    // onClick={() => handleRowClick(c)} 
                    >
                      {c.id}
                    </TableCell>
                    <TableCell>{c.treatmentPlanId}</TableCell>
                    <TableCell>{c.amount}</TableCell>
                    <TableCell>{c.method}</TableCell>
                    <TableCell>
                      <Chip
                        label={c.status}
                        color={c.status === 'Completed' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{c.transactionRef}</TableCell>
                    <TableCell>{c.paidAt}</TableCell>
                    <TableCell>{dateFormat(c.createdAt)}</TableCell>
                    <TableCell>{dateFormat(c.updatedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        )}
        {tab === 4 && (
          <CardContent>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell >ID</TableCell>
                  <TableCell>From</TableCell>
                  <TableCell>For</TableCell>
                  <TableCell>Profile Name</TableCell>
                  <TableCell>Content Type</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Created AT</TableCell>
                  <TableCell>Updated AT</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {patient?.messages?.map((c: ChatMessage) => (
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
                    // onClick={() => handleRowClick(c)} 
                    >
                      {c.id}
                    </TableCell>
                    <TableCell>{c.from}</TableCell>
                    <TableCell>{c.to}</TableCell>
                    <TableCell>{c.profileName}</TableCell>
                    <TableCell>{c.contentType}</TableCell>
                    <TableCell>{c.body}</TableCell>
                    <TableCell>{c.location}</TableCell>
                    <TableCell>{dateFormat(c.createdAt)}</TableCell>
                    <TableCell>{dateFormat(c.updatedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        )}


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
