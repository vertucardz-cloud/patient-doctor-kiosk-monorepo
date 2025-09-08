import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import {

  Card,
  Chip,
  Avatar,
  Button,
  Divider,
  CardMedia,

  CardHeader,
  Typography,

  CardContent,
  CardActions,
  CardActionArea,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

import ConfirmDeleteDialog from './confirm-box/confirm-delete-dialog';

// ----------------------------------------------------------------------

export type DoctorProps = {
  id: string;
  name: string;
  phone: string;
  specialty: string;
  email: string;
  isActive: boolean;
};

type DoctorTableRowProps = {
  row: DoctorProps;
  selected: boolean;
  onSelectRow: () => void;
  onDeleteRow: (id: string) => void;
  onEditRow: () => void;

};

export function DoctorTableRow({ row, selected, onSelectRow, onDeleteRow, onEditRow }: DoctorTableRowProps) {
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
    navigate(`/doctor/${row.id}`, { state: row });

  };

  const handleConfirmDelete = () => onDeleteRow(row.id);


  return (
    <>
      {/* <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell>

        <TableCell component="th" scope="row" onClick={handleRowClick}>
          <Box
            sx={{
              gap: 2,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              textDecoration: 'underline',
              color: 'primary.main',
            }}
          >
          
            {row.name}
          </Box>
        </TableCell>

        <TableCell>{row.email}</TableCell>

        <TableCell>{row.phone}</TableCell>

        <TableCell>{row.specialty}</TableCell>


        <TableCell>
          {row.isActive ? (
            <Iconify width={22} icon="solar:check-circle-bold" sx={{ color: 'success.main' }} />
          ) : (
            '-'
          )}
        </TableCell>



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


    
      <ConfirmDeleteDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        doctorName={row.name}
      /> */}





      <Card
       sx={{
    width: 320, 
    height: 420,
    display: "flex",
    flexDirection: "column",
    borderRadius: 3,
    boxShadow: 4,
  }}
                
      >
        <CardActionArea>

          <CardMedia
            component="img"
            height="140"
            image="https://media.istockphoto.com/id/1692415035/photo/scientists-are-testing-new-drugs-in-the-lab-to-test-some-emerging-diseases-in-research-and.jpg?s=612x612&w=0&k=20&c=Z6rn1XdW0x6147hqP4azROikO-cXUbxWY42YxEsPzHs="
            alt="green iguana"
          />

          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: 'primary.main' }} src='https://shantimukand.com/images/doctor-single.jpg'>
                {/* {!row.avatarUrl &&
                row.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()} */}
              </Avatar>
            }
            action={
              <IconButton onClick={handleOpenPopover}>
                <Iconify icon="eva:more-vertical-fill" />
              </IconButton>
            }
            title={
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  gap: 2,
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'underline',
                  color: 'primary.main',
                }}
                onClick={handleRowClick}


              >
                {row.name}
              </Typography>
            }
            subheader={
              row.isActive ? (
                <Chip
                  icon={<Iconify icon="solar:check-circle-bold" />}
                  label="Active"
                  color="success"
                  size="small"
                />
              ) : (
                <Chip label="Inactive" color="default" size="small" />
              )
            }
          />

          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Iconify icon="eva:email-outline" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2">{row.email}</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Iconify icon="eva:phone-outline" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2">{row.phone}</Typography>
            </Box>

            <Box>
              <Chip label={row.specialty} variant="outlined" color="primary" />
            </Box>
          </CardContent>

          <Divider />

          <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
            <Button
              size="small"
              startIcon={<Iconify icon="solar:pen-bold" />}
              onClick={onEditRow}
            >
              Edit
            </Button>
            <Button
              size="small"
              color="error"
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              onClick={() => setConfirmOpen(true)}
            >
              Delete
            </Button>
          </CardActions>
        </CardActionArea>
      </Card>

      {/* Popover Menu */}
      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList>
          <MenuItem
            onClick={() => {
              handleClosePopover();
              onEditRow();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleClosePopover();
              setConfirmOpen(true);
            }}
            sx={{ color: 'error.main' }}
          >
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
        doctorName={row.name}
      />
    </>
  );
}
