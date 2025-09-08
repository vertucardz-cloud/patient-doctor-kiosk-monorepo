import type { ISortBy, Patient, IPatientFilter, IPatientResponse } from 'src/services/patient/patient.service';

import dayjs from 'dayjs';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { DashboardContent } from 'src/layouts/dashboard';
import PatientService from 'src/services/patient/patient.service';

import { Scrollbar } from 'src/components/scrollbar';

import { emptyRows } from '../utils';
import { PatientNoData } from '../table-no-data';
import { PatientEmptyRows } from '../table-empty-rows';
import { PatientTableRow } from '../patient-table-row';
import { PatientTableHead } from '../patient-table-head';
import { PatientToolbar } from '../patient-table-toolbar';

// ----------------------------------------------------------------------

export function PatientView() {
  const {
    page,
    order,
    orderBy,
    selected,
    rowsPerPage,
    onSort,
    onSelectRow,
    onChangePage,
    onSelectAllRows,
    onChangeRowsPerPage,
  } = useTable();

  const [patient, setPtients] = useState<Patient[]>([])
 
  const [filterName] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  const [filters, setFilters] = useState<IPatientFilter>({
    "firstname": "",
    "lastname": "",
    "fullname": "",
    "phone": "",
    "email": "",
    "gender": "",
    "ageMin": 0,
    "ageMax": 0,
    "franchiseId": "",
    "isActive": false,
    "includeFranchise": false,
    "createdAtStart": "",
    "createdAtEnd": ""
  });


  const dataFiltered: Patient[] = patient?.filter((pta: Patient) => {
    const createdAt = dayjs(pta.createdAt);

    return (
      (!filters.firstname || pta.firstname.toLowerCase().includes(filters.firstname.toLowerCase())) &&
      (!filters.lastname || pta.lastname.toLowerCase().includes(filters.lastname.toLowerCase())) &&
      (!filters.email || pta.email.toLowerCase().includes(filters.email.toLowerCase())) &&
      (!filters.phone || pta.phone.toLowerCase().includes(filters.phone.toLowerCase())) &&
      (!filters.gender || pta.gender.toLowerCase().includes(filters.gender.toLowerCase())) &&
      (!filters.ageMin || pta.age >= filters.ageMin) &&
      (!filters.ageMax || pta.age <= filters.ageMax) &&
      
      (!filters.createdAtStart || createdAt.isAfter(filters.createdAtStart, "day")) &&
      (!filters.createdAtEnd || createdAt.isBefore(filters.createdAtEnd, "day"))
    );
  });


  // const notFound = !dataFiltered.length && !!filterName;
  const notFound = false;


  const loadPatients = useCallback(async () => {
    try {
      const data = {
        page : page + 1,
        limit: rowsPerPage,
        sort: {
          name: orderBy,
          order
        } as ISortBy,
        filter: filters
      }
      const response = await PatientService.getPatients(data) as unknown as IPatientResponse;
      setPtients(response?.result);
      setTotalCount(response?.total);


    } catch (err) {
      console.error('Failed to load franchises:', err);
    }
  }, [page, orderBy, order, filters, rowsPerPage]);


  useEffect(() => {
    loadPatients();
  }, [loadPatients,]);

  return (
    <DashboardContent>
      <Box
        sx={{
          mb: 5,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Patient
        </Typography>
      </Box>

      <Card>
        <PatientToolbar
          numSelected={selected.length}
        // filterName={filterName}
        // onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
        //   setFilterName(event.target.value);
        //   table.onResetPage();
        // }}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <PatientTableHead
                order={order}
                orderBy={orderBy}
                onSort={onSort}
                rowCount={patient.length}
                numSelected={selected.length}
                onSelectAllRows={(checked) =>
                  onSelectAllRows(
                    checked,
                    patient.map((pt) => pt.id)
                  )
                }
                headLabel={[
                  { id: 'firstname', label: 'First name', filterKey: 'firstname', sortable: true },
                  { id: 'lastname', label: 'Last name', filterKey: 'lastname', sortable: true },
                  { id: 'gender', label: 'Gender', filterKey: 'gender', sortable: true },
                  { id: 'email', label: 'Email', filterKey: 'email', sortable: true },
                  { id: 'phone', label: 'Phone', filterKey: 'phone', sortable: true },
                  { id: 'age', label: 'Age',filterKey: 'age',sortable: true },
                  { id: 'createdAt',label: 'Created At',filterKey: 'createdAtRange',sortable: true },
                  { id: '', label: '' },
                ]}
                filters={filters}
                onFilterChange={(key, value) =>
                  setFilters((prev) => ({ ...prev, [key]: value }))
                }
              />
              <TableBody>
                {dataFiltered
                  .map((row) => (
                    <PatientTableRow
                      key={row.id}
                      row={row}
                      selected={selected.includes(row.id)}
                      onSelectRow={() => onSelectRow(row.id)}
                    />
                  ))}

                <PatientEmptyRows
                  height={68}
                  emptyRows={emptyRows(page, rowsPerPage, patient.length)}
                />

                {notFound && <PatientNoData searchQuery={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={page}
          count={totalCount}
          rowsPerPage={rowsPerPage}
          onPageChange={onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={onChangeRowsPerPage}
        />
      </Card>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('createdAt');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const onSelectAllRows = useCallback((checked: boolean, newSelecteds: string[]) => {
    if (checked) {
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  }, []);

  const onSelectRow = useCallback(
    (inputValue: string) => {
      const newSelected = selected.includes(inputValue)
        ? selected.filter((value) => value !== inputValue)
        : [...selected, inputValue];

      setSelected(newSelected);
    },
    [selected]
  );

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      onResetPage();
    },
    [onResetPage]
  );

  return {
    page,
    order,
    onSort,
    orderBy,
    selected,
    rowsPerPage,
    onSelectRow,
    onResetPage,
    onChangePage,
    onSelectAllRows,
    onChangeRowsPerPage,
  };
}
