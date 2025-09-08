import { toast } from 'react-toastify';
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
import userService from 'src/services/user/user.service';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import FormFieldsDialog from './create-user';
import { TableNoData } from '../table-no-data';
import { UserTableRow } from '../user-table-row';
import { UserTableHead } from '../user-table-head';
import { TableEmptyRows } from '../table-empty-rows';
import { UserTableToolbar } from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

import type { UserProps } from '../user-table-row';


// ----------------------------------------------------------------------

export function UserView() {
  const table = useTable();
  const [users, setUser] = useState<UserProps[]>([]);

  const [filterName, setFilterName] = useState('');
  
  const dataFiltered: UserProps[] = applyFilter({
    inputData: users,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });
  
  const [selectedUser, setSelectedUser] = useState<UserProps | null>(null);
  
    const [open, setOpen] = useState(false);
  
  
    const notFound = !dataFiltered.length && !!filterName;
  
    const handleOpenModal = useCallback(() => {
      setOpen(true);
    }, []);
  
    const handleCloseModal = useCallback(() => {
      setOpen(false);
      setSelectedUser(null);
  
    }, []);
  
  
    // DELETE franchise
    const handleDeleteRow = async (id: string) => {
      try {
        await userService.deleteUser(id);
        await loadUsers();
  
      } catch (err) {
        console.error("Failed to delete franchise:", err);
      }
    };
  
    // EDIT franchise
    const handleEditRow = (id: string) => {
      const user = users.find(u => u.id === id);
      if (user) {
        setSelectedUser(user);
        setOpen(true);
      }
    };
  
    const loadUsers = useCallback(async () => {
      try {
       const res = await userService.getUsers();
        if (res) {
          const mappedUsers: UserProps[] = res.data?.map((user: any) => ({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            status: user.status,
            avatarUrl: user.avatarUrl,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          }));
          setUser(mappedUsers);
        }
      } catch (err) {
        console.error('Failed to load users:', err);
      }
    }, []);
  
  
    useEffect(() => {
      loadUsers();
    }, [loadUsers]);
  
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
          Users
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          onClick={handleOpenModal}
          startIcon={<Iconify icon="mingcute:add-line" />}
        >
          New user
        </Button>
        <FormFieldsDialog
          open={open}
          onClose={handleCloseModal}
          onSuccess={loadUsers}
          initialData={selectedUser}
        />
      </Box>

      <Card>
        <UserTableToolbar
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
              <UserTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={users.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    users.map((user) => user.id)
                  )
                }
                headLabel={[
                  { id: 'username', label: 'Username' },
                  { id: 'role', label: 'Role' },
                  { id: 'isVerified', label: 'Verified', align: 'center' },
                  { id: 'status', label: 'Status' },
                  { id: 'email', label: 'Email' },
                  { id: 'createdAt', label: 'Created Date' },
                  { id: '', label: ''},
                ]}
              />
              <TableBody>
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row) => (
                    <UserTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onEditRow={() => handleEditRow(row.id)}
                      onDeleteRow={() => handleDeleteRow(String(row.id))}
                    />
                  ))}

                <TableEmptyRows
                  height={68}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, users.length)}
                />

                {notFound && <TableNoData searchQuery={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={table.page}
          count={users.length}
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
  const [orderBy, setOrderBy] = useState('username');
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
