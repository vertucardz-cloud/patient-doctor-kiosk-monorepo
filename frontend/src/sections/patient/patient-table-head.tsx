import type { Dayjs } from "dayjs";
import type { IPatientFilter } from "src/services/patient/patient.service";

import dayjs from "dayjs";

import Box from "@mui/material/Box";
import { TextField } from "@mui/material";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";
import TableHead from "@mui/material/TableHead";
import TableCell from "@mui/material/TableCell";
import TableSortLabel from "@mui/material/TableSortLabel";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { visuallyHidden } from "./utils";

// ----------------------------------------------------------------------

type UserTableHeadProps = {
  rowCount: number;
  numSelected: number;
  headLabel: {
    id: string;
    label: string;
    align?: "left" | "right" | "center";
    width?: number | string;
    minWidth?: number | string;
    filterKey?: string;
    sortable?: boolean; // 👈 NEW
  }[];
  onSelectAllRows: (checked: boolean) => void;
  onFilterChange?: (key: string, value: string) => void;
  filters: IPatientFilter;

  // 👇 Sorting props
  orderBy: string;
  order: "asc" | "desc";
  onSort: (id: string) => void;
};

const inputStyle = {
  bgcolor: "grey.100",
  borderRadius: 1,
  "& input::placeholder": {
    fontSize: "0.85rem",
    color: "text.secondary",
  },
};

export function PatientTableHead({
  rowCount,
  headLabel,
  numSelected,
  onSelectAllRows,
  onFilterChange,
  filters,
  order,
  orderBy,
  onSort,
}: UserTableHeadProps) {
  return (
    <TableHead>
      {/* Header Row */}
      <TableRow>
        <TableCell padding="checkbox" sx={{ width: 50 }}>
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              onSelectAllRows(event.target.checked)
            }
          />
        </TableCell>

        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align || "center"}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ width: headCell.width, minWidth: headCell.minWidth }}
          >
            {headCell.sortable ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : "asc"}
                onClick={() => onSort(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box sx={{ ...visuallyHidden }}>
                    {order === "desc" ? "sorted descending" : "sorted ascending"}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>

      {/* Filter Row */}
      <TableRow>
        <TableCell padding="checkbox" sx={{ width: 50 }} /> {/* Empty cell */}

        {headLabel.map((headCell) => (
          <TableCell key={headCell.id} align={headCell.align || "center"}>
            {headCell.filterKey === "createdAtRange" ? (
              <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                <DatePicker
                  label="From"
                  value={
                    filters["createdAtStart"]
                      ? dayjs(filters["createdAtStart"])
                      : null
                  }
                  onChange={(date: Dayjs | null) =>
                    onFilterChange?.(
                      "createdAtStart",
                      date ? date.toISOString() : ""
                    )
                  }
                  slotProps={{
                    textField: {
                      size: "small",
                      sx: { ...inputStyle, width: 130 },
                    },
                  }}
                />

                <DatePicker
                  label="To"
                  value={
                    filters["createdAtEnd"]
                      ? dayjs(filters["createdAtEnd"])
                      : null
                  }
                  onChange={(date: Dayjs | null) =>
                    onFilterChange?.(
                      "createdAtEnd",
                      date ? date.toISOString() : ""
                    )
                  }
                  slotProps={{
                    textField: {
                      size: "small",
                      sx: { ...inputStyle, width: 130 },
                    },
                  }}
                />
              </Box>
            ) : headCell.filterKey === "age" ? (
              <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                <TextField
                  size="small"
                  type="number"
                  placeholder="Min Age"
                  value={
                    filters["ageMin"] && Number(filters["ageMin"]) !== 0
                      ? filters["ageMin"]
                      : ""
                  }
                  onChange={(e) => onFilterChange?.("ageMin", e.target.value)}
                  sx={{ ...inputStyle, width: 80 }}
                />
                <TextField
                  size="small"
                  type="number"
                  placeholder="Max Age"
                  value={
                    filters["ageMax"] && Number(filters["ageMax"]) !== 0
                      ? filters["ageMax"]
                      : ""
                  }
                  onChange={(e) => onFilterChange?.("ageMax", e.target.value)}
                  sx={{ ...inputStyle, width: 80 }}
                />
              </Box>
            ) : headCell.filterKey ? (
              <TextField
                size="small"
                fullWidth
                placeholder={`Search ${headCell.label}`}
                value={filters[headCell.filterKey as keyof IPatientFilter] ?? ""}
                onChange={(e) =>
                  onFilterChange?.(headCell.filterKey!, e.target.value)
                }
                sx={{
                  ...inputStyle,
                  minWidth:
                    headCell.id === "email" || headCell.id === "phone"
                      ? 160
                      : 120,
                }}
              />
            ) : null}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

