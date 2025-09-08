import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import ConfirmDeleteDialog from './confirm-box/confirm-delete-dialog';

// ----------------------------------------------------------------------

export type UserProps = {
  id: string;
  username: string;
  email: string;
  role: "doctor" | "admin" | "patient" | "staff" | 'support';
  status: string
  avatarUrl?: string;
  isVerified?: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}


type UserTableRowProps = {
  row: UserProps;
  selected: boolean;
  onSelectRow: () => void;
  onEditRow: () => void;
  onDeleteRow: () => void;
};

export function UserTableRow({ row, selected, onSelectRow, onEditRow, onDeleteRow }: UserTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
   const [confirmOpen, setConfirmOpen] = useState(false);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const navigate = useNavigate();

  const handleRowClick = () => {
    navigate(`/user/${row.id}`, { state: row });
  };

  const handleConfirmDelete = () => {
    onDeleteRow();
    setConfirmOpen(false);
  };

  return (
    <>
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
            <Avatar alt={row.username} src={row.avatarUrl} />
            {row.username}
          </Box>
        </TableCell>

        <TableCell>{row.role}</TableCell>

        <TableCell align="center">
          {row.isVerified ? (
            <Iconify width={22} icon="solar:check-circle-bold" sx={{ color: 'success.main' }} />
          ) : (
            '-'
          )}
        </TableCell>

        <TableCell>
          <Label color={(row.status === 'banned' && 'error') || 'success'}>{row.status}</Label>
        </TableCell>
        <TableCell>{row.email}</TableCell>
        <TableCell>{row.createdAt}</TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 140,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
            },
          }}
        >
          <MenuItem onClick={() => {
            handleClosePopover();
            onEditRow();
          }}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>

          <MenuItem onClick={() => {
            handleClosePopover();
            setConfirmOpen(true);
          }} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </Popover>

      {/* Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
