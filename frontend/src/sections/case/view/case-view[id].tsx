import { Icon } from "@iconify/react";
import { toast } from "react-toastify";
import { useState, useEffect } from 'react';
import { useParams , useLocation} from "react-router-dom";

import {
  Box,
  Grid,
  Chip,
  Paper,
  Divider,
  Container,
  Typography,
} from "@mui/material";

// import CaseService from 'src/services/case/case.service';


// ---------------------------------------------
// Case Interfaces
// ---------------------------------------------

export interface Case {
  id: string;
  qrCodeId: string;
  franchiseId: string;
  patientId: string;
  doctorId: string | null;
  description: string;
  status: 'NEW' | 'IN_PROGRESS' | 'CLOSED' | 'CANCELLED'; // adjust enums as per backend
  doctorNotes: string;
  medicationCost: number;
  followUpDate: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
  mediaFiles?: string[]; // optional if backend supports
}

// ---------------------------------------------
// DTOs
// ---------------------------------------------

export interface CreateCaseDto {
  qrCodeId: string;
  franchiseId: string;
  patientId: string;
  doctorId?: string | null;
  description: string;
  status?: 'NEW' | 'IN_PROGRESS' | 'CLOSED' | 'CANCELLED'; // defaults to NEW if backend handles it
  doctorNotes?: string;
  medicationCost?: number;
  followUpDate?: string | Date;
  mediaFiles?: string[];
}

export interface UpdateCaseDto {
  description?: string;
  status?: 'NEW' | 'IN_PROGRESS' | 'CLOSED' | 'CANCELLED';
  doctorNotes?: string;
  medicationCost?: number;
  followUpDate?: string | Date;
  mediaFiles?: string[];
}



export function CaseViewID() {
  // const [ cases , setCase] = useState<Partial<Case>>({
  //     id: "",
  //     qrCodeId: "",
  //     franchiseId: "",
  //     patientId: "",
  //     doctorId: "",
  //     description: "",
  //     status: "NEW", 
  //     doctorNotes: "",
  //     medicationCost: 0,
  //     followUpDate: "",
  //     createdAt: "",
  //     updatedAt: "",
  //     mediaFiles: [] 
  // })
  const { caseId } = useParams();
   const location = useLocation();
  const cases = location.state as Case;

  if (!cases) {
    return (
      <Container sx={{ mt: 8 }}>
        <Typography variant="h6" color="error" align="center">
          Case data not found.
        </Typography>
      </Container>
    );
  }

  // useEffect (() =>{
  //   const fetchedCases = async () =>{
  //     try {

  //       if(caseId) {
  //         const res = await CaseService.getById(caseId)
  //         console.log('----------res-------------', res)
  //         if(res) {
  //           // setCase(res.data)
  //         }
  //       } else {
  //         toast('Case Id is required');
  //       }
        
  //     } catch (e) {
  //       console.error('-----Error--------------',e);
  //     }
  //   }
  //   fetchedCases();
  // },[caseId])

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
              {cases?.description?.charAt(0).toUpperCase() + cases?.description?.slice(1)}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Case Information
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box display="flex" flexDirection="column" gap={2}>
              <DetailItem icon="solar:letter-bold-duotone" label="Description" value={cases?.description} />
              <DetailItem icon="solar:letter-bold-duotone" label="Medication Cost" value={cases?.medicationCost?.toString()} />
              <DetailItem icon="solar:letter-bold-duotone" label="Doctor Notes" value={cases?.doctorNotes} />
              <DetailItem icon="solar:letter-bold-duotone" label="Follow UP" value={cases?.followUpDate?.toString()} />

              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <Icon icon="solar:shield-check-bold-duotone" width={22} />
                <Typography variant="subtitle1" fontWeight={600}>
                  Status:
                </Typography>
                <Chip
                  label={cases.status ? "Active" : "Inactive"}
                  color={cases.status ? "success" : "error"}
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
