import type { Doctor} from 'src/services/doctor/doctor.service';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import { Grid } from '@mui/material';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TablePagination from '@mui/material/TablePagination';

import { DashboardContent } from 'src/layouts/dashboard';
import DoctorService from 'src/services/doctor/doctor.service';

import { Iconify } from 'src/components/iconify';

import FormFieldsDialog from './create-doctor';
import { DoctorNoData } from '../table-no-data';
import { DoctorTableRow } from '../doctor-table-row';
import { DoctorEmptyRows } from '../table-empty-rows';
import { DoctorToolbar } from '../doctor-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

import type { DoctorProps } from '../doctor-table-row';

// ----------------------------------------------------------------------

export function DoctorView() {
    const table = useTable();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

    const [filterName, setFilterName] = useState('');

    const [open, setOpen] = useState(false);

    const dataFiltered: DoctorProps[] = applyFilter({
        inputData: doctors as DoctorProps[],
        comparator: getComparator(table.order, table.orderBy),
        filterName,
    });

    const notFound = !dataFiltered.length && !!filterName;

    const handleOpenModal = useCallback(() => {
        setOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setOpen(false);
        setSelectedDoctor(null);

    }, []);


    // DELETE franchise
    const handleDeleteRow = async (id: string) => {
        try {
            await DoctorService.deleteDoctor(id);
            await loadDoctors();

        } catch (err) {
            console.error("Failed to delete franchise:", err);
            throw err;
        }
    };

    // EDIT franchise
    const handleEditRow = (id: string) => {
        const doctor = doctors.find(f => f.id === id);
        if (doctor) {
            setSelectedDoctor(doctor);
            setOpen(true);
        }
    };

    const loadDoctors = useCallback(async () => {
        try {
            const res = await DoctorService.getDoctors();
            setDoctors(res);

        } catch (err) {
            console.error('Failed to load Doctors:', err);
        }
    }, []);


    useEffect(() => {
        loadDoctors();
    }, [loadDoctors]);

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
                        Doctor
                    </Typography>
                    <Button
                        variant="contained"
                        color="inherit"
                        startIcon={<Iconify icon="mingcute:add-line" />}
                        onClick={handleOpenModal}
                        sx={{ mr: 2 }}
                    >
                        New Doctor
                    </Button>

                    <FormFieldsDialog
                        open={open}
                        onClose={handleCloseModal}
                        onSuccess={loadDoctors}
                        initialData={selectedDoctor}
                    />
                </Box>





                <Card
                    sx={{

                        borderRadius: 3,
                        boxShadow: '0px 6px 16px rgba(0,0,0,0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {/* Toolbar */}
                    <DoctorToolbar
                        numSelected={table.selected.length}
                        filterName={filterName}
                        onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
                            setFilterName(event.target.value);
                            table.onResetPage();
                        }}
                    />

                    {/* <Scrollbar> */}
                    <Box sx={{ overflow: 'auto', p: 5, justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
                        <Grid container spacing={2}>
                            {dataFiltered
                                .slice(
                                    table.page * table.rowsPerPage,
                                    table.page * table.rowsPerPage + table.rowsPerPage
                                )
                                .map((row) => (
                                    <Grid

                                    >
                                        <DoctorTableRow
                                            row={row}
                                            selected={table.selected.includes(row.id)}
                                            onSelectRow={() => table.onSelectRow(row.id)}
                                            onDeleteRow={() => handleDeleteRow(String(row.id))}
                                            onEditRow={() => handleEditRow(row.id)}
                                        />
                                    </Grid>
                                ))}

                            {/* Empty rows (optional in card layout, but kept for consistency) */}
                            <Grid>
                                <DoctorEmptyRows
                                    height={68}
                                    emptyRows={emptyRows(table.page, table.rowsPerPage, doctors.length)}
                                />
                            </Grid>

                            {/* No Data fallback */}
                            {notFound && (
                                <Grid>
                                    <DoctorNoData searchQuery={filterName} />
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                    {/* </Scrollbar> */}

                    {/* Pagination */}
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <TablePagination
                            component="div"
                            page={table.page}
                            count={doctors.length}
                            rowsPerPage={table.rowsPerPage}
                            onPageChange={table.onChangePage}
                            rowsPerPageOptions={[8, 16, 32]} // ✅ custom options
                            onRowsPerPageChange={table.onChangeRowsPerPage}
                        />
                    </Box>
                </Card>



                {/* <Card> */}
                {/* <DoctorToolbar
                    numSelected={table.selected.length}
                    filterName={filterName}
                    onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setFilterName(event.target.value);
                        table.onResetPage();
                    }}
                /> */}

                {/* <Scrollbar> */}
                {/* <TableContainer sx={{ overflow: 'unset' }}>
                        <Table sx={{ minWidth: 800 }}>
                            <DoctorTableHead
                                order={table.order}
                                orderBy={table.orderBy}
                                rowCount={doctors.length}
                                numSelected={table.selected.length}
                                onSort={table.onSort}
                                onSelectAllRows={(checked) =>
                                    table.onSelectAllRows(
                                        checked,
                                        doctors.map((user) => user.id)
                                    )
                                }
                                headLabel={[
                                    { id: 'name', label: 'Name' },
                                    { id: 'email', label: 'Email' },
                                    { id: 'phone', label: 'Phone' },
                                    { id: 'specialty', label: 'Specialty' },
                                    { id: 'isActive', label: 'isActive' },
                                    { id: '' },
                                ]}
                            />
                            <TableBody> */}
                {/* {dataFiltered
                                    .slice(
                                        table.page * table.rowsPerPage,
                                        table.page * table.rowsPerPage + table.rowsPerPage
                                    )
                                    .map((row) => (
                                        <DoctorTableRow
                                            key={row.id}
                                            row={row}
                                            selected={table.selected.includes(row.id)}
                                            onSelectRow={() => table.onSelectRow(row.id)}
                                            onDeleteRow={() => handleDeleteRow(String(row.id))}
                                            onEditRow={() => handleEditRow(row.id)}
                                        />
                                    ))}

                                <DoctorEmptyRows
                                    height={68}
                                    emptyRows={emptyRows(table.page, table.rowsPerPage, doctors.length)}
                                />

                                {notFound && <DoctorNoData searchQuery={filterName} />} */}
                {/* </TableBody>
                        </Table>
                    </TableContainer> */}
                {/* </Scrollbar> */}

                {/* <TablePagination
                    component="div"
                    page={table.page}
                    count={doctors.length}
                    rowsPerPage={table.rowsPerPage}
                    onPageChange={table.onChangePage}
                    rowsPerPageOptions={[5, 10, 25]}
                    onRowsPerPageChange={table.onChangeRowsPerPage}
                /> */}
                {/* </Card> */}
            </DashboardContent>
    );
}

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('name');
  const [rowsPerPage, setRowsPerPage] = useState(8); // ✅ default now matches options
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