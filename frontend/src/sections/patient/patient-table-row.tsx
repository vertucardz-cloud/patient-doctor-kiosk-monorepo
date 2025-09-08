import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';



// ----------------------------------------------------------------------

export type PatientProps = {
  id: string,
  firstname: string;
  lastname: string;
  email: string;
  gender: string;
  phone: string;
  status: string;
  age: number;
  franchiseId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type PatientTableRowProps = {
  row: PatientProps;
  selected: boolean;
  onSelectRow: () => void;
};

export function PatientTableRow({ row, selected, onSelectRow }: PatientTableRowProps) {


  const navigate = useNavigate();

  const handleRowClick = () => {
    navigate(`/patient/${row.id}`, { state: row });
  };

  return (
    <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
      </TableCell>

      <TableCell component="th" scope="row">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
            color: "primary.main",
            textDecoration: "underline",
            fontWeight: 500,
          }}
          onClick={handleRowClick}
        >
          {row.firstname}
        </Box>
      </TableCell>

      <TableCell>{row.lastname}</TableCell>
      <TableCell sx={{ textTransform: "capitalize" }}>{row.gender}</TableCell>

      <TableCell>
        
          {row.email}
       
      </TableCell>

      <TableCell>{row.phone}</TableCell>

      <TableCell align="center">{row.age}</TableCell>

      <TableCell align="center">{dayjs(row.createdAt).format("YYYY-MM-DD")}</TableCell>

    </TableRow>
  );
}
