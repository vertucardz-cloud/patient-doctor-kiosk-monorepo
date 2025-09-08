import type { Franchise } from 'src/services/franchise/franchise.service';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { DashboardContent } from 'src/layouts/dashboard';
import FranchiseService from 'src/services/franchise/franchise.service';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import FormFieldsDialog from './create-franchise';
import { FranchiseNoData } from '../table-no-data';
import { FranchiseEmptyRows } from '../table-empty-rows';
import { FranchiseTableRow } from '../franchise-table-row';
import { FranchiseTableHead } from '../franchise-table-head';
import { FranchiseToolbar } from '../franchise-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

import type { FranchiseProps } from '../franchise-table-row';

// ----------------------------------------------------------------------

export function FranchiseView() {
  const table = useTable();
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [selectedFranchise, setSelectedFranchise] = useState<Franchise | null>(null);

  const [filterName, setFilterName] = useState('');

  const [open, setOpen] = useState(false);

  const dataFiltered: FranchiseProps[] = applyFilter({
    inputData: franchises as FranchiseProps[],
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  const handleOpenModal = useCallback(() => {
    setOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setOpen(false);
    setSelectedFranchise(null);

  }, []);


  // DELETE franchise
  const handleDeleteRow = async (id: string) => {
    try {
      await FranchiseService.deleteFranchise(id);
      await loadFranchises();

    } catch (err) {
      console.error("Failed to delete franchise:", err);
    }
  };

  // EDIT franchise
  const handleEditRow = (id: string) => {
    const franchise = franchises.find(f => f.id === id);
    if (franchise) {
      setSelectedFranchise(franchise);
      setOpen(true);
    }
  };

  const loadFranchises = useCallback(async () => {
    try {
      const res = await FranchiseService.getFranchises();
      setFranchises(res);

    } catch (err) {
      console.error('Failed to load franchises:', err);
    }
  }, []);


  useEffect(() => {
    loadFranchises();
  }, [loadFranchises]);



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
          Franchise
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpenModal}
          sx={{ mr: 2 }}
        >
          New Franchise
        </Button>

        <FormFieldsDialog
          open={open}
          onClose={handleCloseModal}
          onSuccess={loadFranchises}
          initialData={selectedFranchise}
        />
      </Box>

      <Card>
        <FranchiseToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
            setFilterName(event.target.value);
            table.onResetPage();
          }}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <FranchiseTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={franchises.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    franchises.map((user) => user.id)
                  )
                }
                headLabel={[
                  { id: 'name', label: 'Franchise' },
                  // { id: 'address', label: 'Address' },
                  { id: 'email', label: 'Email' },
                  { id: 'phone', label: 'Phone' },
                  { id: 'city', label: 'City' },
                  { id: 'state', label: 'State' },
                  { id: 'postalCode', label: 'postalCode' },
                  { id: 'country', label: 'Country' },
                  { id: 'isActive', label: 'Active' },
                  { id: 'qr-code', label: 'QR Code' },
                  { id: '' },
                ]}
              />
              <TableBody>
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row) => (
                    <FranchiseTableRow
                      key={row.id}
                      row={row}
                      qrCodes={row.qrCodes}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onDeleteRow={() => handleDeleteRow(String(row.id))}
                      onEditRow={() => handleEditRow(row.id)}
                    />
                  ))}

                <FranchiseEmptyRows
                  height={68}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, franchises.length)}
                />

                {notFound && <FranchiseNoData searchQuery={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={table.page}
          count={franchises.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />

      </Card>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('name');
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




