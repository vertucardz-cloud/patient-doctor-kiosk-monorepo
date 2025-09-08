// import Box from '@mui/material/Box';
// import TableRow from '@mui/material/TableRow';
// import Checkbox from '@mui/material/Checkbox';
// import TableHead from '@mui/material/TableHead';
// import TableCell from '@mui/material/TableCell';
// import TableSortLabel from '@mui/material/TableSortLabel';

// import { visuallyHidden } from './utils';

// // ----------------------------------------------------------------------

// type UserTableHeadProps = {
//   orderBy: string;
//   rowCount: number;
//   numSelected: number;
//   order: 'asc' | 'desc';
//   onSort: (id: string) => void;
//   headLabel: Record<string, any>[];
//   onSelectAllRows: (checked: boolean) => void;
// };

// export function FranchiseTableHead({
//   order,
//   onSort,
//   orderBy,
//   rowCount,
//   headLabel,
//   numSelected,
//   onSelectAllRows,
// }: UserTableHeadProps) {
//   return (
//     <TableHead>
//       <TableRow>
//         <TableCell padding="checkbox">
//           <Checkbox
//             indeterminate={numSelected > 0 && numSelected < rowCount}
//             checked={rowCount > 0 && numSelected === rowCount}
//             onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
//               onSelectAllRows(event.target.checked)
//             }
//           />
//         </TableCell>

//         {headLabel.map((headCell) => (
//           <TableCell
//             key={headCell.id}
//             align={headCell.align || 'left'}
//             sortDirection={orderBy === headCell.id ? order : false}
//             sx={{ width: headCell.width, minWidth: headCell.minWidth }}
//           >
//             <TableSortLabel
//               hideSortIcon
//               active={orderBy === headCell.id}
//               direction={orderBy === headCell.id ? order : 'asc'}
//               onClick={() => onSort(headCell.id)}
//             >
//               {headCell.label}
//               {orderBy === headCell.id ? (
//                 <Box sx={{ ...visuallyHidden }}>
//                   {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
//                 </Box>
//               ) : null}
//             </TableSortLabel>
//           </TableCell>
//         ))}
//       </TableRow>
//     </TableHead>
//   );
// }

import Box from "@mui/material/Box";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";
import TableHead from "@mui/material/TableHead";
import TableCell from "@mui/material/TableCell";
import TableSortLabel from "@mui/material/TableSortLabel";

import { visuallyHidden } from "./utils";

// ----------------------------------------------------------------------

type UserTableHeadProps = {
  orderBy: string;
  rowCount: number;
  numSelected: number;
  order: "asc" | "desc";
  onSort: (id: string) => void;
  headLabel: Record<string, any>[];
  onSelectAllRows: (checked: boolean) => void;
};

export function FranchiseTableHead({
  order,
  onSort,
  orderBy,
  rowCount,
  headLabel,
  numSelected,
  onSelectAllRows,
}: UserTableHeadProps) {
  return (
    <TableHead sx={{ bgcolor: "grey.100" }}>
      <TableRow>
        {/* Checkbox column */}
        <TableCell
          padding="checkbox"
          sx={{ width: 50, bgcolor: "grey.100", borderBottom: "2px solid #e0e0e0" }}
        >
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              onSelectAllRows(event.target.checked)
            }
          />
        </TableCell>

        {/* Header columns */}
        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align || "left"}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{
              width: headCell.width,
              minWidth: headCell.minWidth,
              fontWeight: "bold",
              textTransform: "uppercase",
              fontSize: "0.85rem",
              color: "text.primary",
              borderBottom: "2px solid #e0e0e0",
            }}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={() => onSort(headCell.id)}
              // IconComponent={(props) => (
              //   <span {...props} style={{ fontSize: "0.9rem" }}>
              //     ▼
              //   </span>
              // )}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box sx={{ ...visuallyHidden }}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
