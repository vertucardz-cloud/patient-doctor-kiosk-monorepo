import type { Key } from 'react';

import { useNavigate } from 'react-router-dom';
import { useRef, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import { Stack, Button, Dialog, Typography, DialogTitle, DialogContent } from '@mui/material';

import { Iconify } from 'src/components/iconify';

import ConfirmDeleteDialog from './confirm-box/confirm-delete-dialog';

export type FranchiseProps = {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isActive: boolean;
  qrCodes?: { id: string; qrImageUrl: string; franchiseId: string }[];
};

type FranchiseTableRowProps = {
  row: FranchiseProps;
  selected: boolean;
  onSelectRow: () => void;
  onDeleteRow: (id: string) => void;
  onEditRow: () => void;
  qrCodes?: { id: string; qrImageUrl: string }[]
};

export function FranchiseTableRow({
  row,
  selected,
  onSelectRow,
  onDeleteRow,
  onEditRow,
  qrCodes

}: FranchiseTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const [qrOpen, setQrOpen] = useState(false);


  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const navigate = useNavigate();

  const handleRowClick = () => {
    navigate(`/franchise/${row.id}`, { state: row });
  };

  const handleConfirmDelete = () => {
    onDeleteRow(row.id);
    setConfirmOpen(false);
  };



const handleDownloadQr = () => {
  const img = qrRef.current?.querySelector("img") as HTMLImageElement | null;
  if (!img) return;

  const link = document.createElement("a");
  link.href = img.src; 
  link.download = "qrcode.png";
  link.click();
};

const handlePrintQr = () => {
  const img = qrRef.current?.querySelector("img") as HTMLImageElement | null;
  if (!img) return;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(`
      <html>
        <head>
          <title>Print QR</title>
          <style>
            @media print {
              body {
                background: #f0f4ff !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
            body {
              margin: 0;
              height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              background: #f0f4ff; 
            }
            img {
              width: 250px;
              height: 250px;
              padding: 12px;
              background: white;
            }
          </style>
        </head>
        <body>
          <img src="${img.src}" alt="QR Code" />
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); }
            }
          </script>
        </body>
      </html>
    `);
    win.document.close();
  }
};


  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
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

        {/* <AddressCell
          address={`${row.address}, ${row.city}, ${row.state} - ${row.postalCode}, ${row.country}`}
        /> */}

        {/* <TableCell>{row.address}</TableCell> */}
        <TableCell>{row.email}</TableCell>
        <TableCell>{row.phone}</TableCell>
        <TableCell>{row.city}</TableCell>
        <TableCell>{row.state}</TableCell>
        <TableCell>{row.postalCode}</TableCell>
        <TableCell>{row.country}</TableCell>


        <TableCell align="center">
          {row.isActive ? (
            <Iconify width={22} icon="solar:check-circle-bold" sx={{ color: 'success.main' }} />
          ) : (
            '-'
          )}
        </TableCell>

        <TableCell align="center">
          <IconButton onClick={() => setQrOpen(true)}>
            <Iconify width={22} icon="qr-code:qrcode" sx={{ color: 'info.main' }} />
          </IconButton>
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

      {/* QR Code Dialog */}

      <Dialog open={qrOpen} onClose={() => setQrOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: "center", fontWeight: 600 }}>
          Scan & Save QR Code

          <IconButton
            aria-label="close"
            onClick={() => setQrOpen(false)}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Iconify icon={"eva:close-fill" as any} width={20} height={20} />
          </IconButton>

        </DialogTitle>

        <DialogContent sx={{ display: "flex", justifyContent: "center", gap: 3, p: 3 }}>
          {/* QR Code (Left Side) */}
          {/* <Box
            ref={qrRef}
            sx={{
              p: 2,
              bgcolor: "grey.50",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "grey.200",
              boxShadow: "inset 0px 1px 4px rgba(0,0,0,0.1)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <QRCodeCanvas value="https://your-link-or-data-here" size={200} />
          </Box> */}


          {qrCodes?.length ? (
            qrCodes.map((qr: { id: Key | null | undefined; qrImageUrl: string }) => (
              <Box key={qr.id} ref={qrRef}>
                <img src={qr.qrImageUrl} alt="QR Code" width={200} height={200} />
              </Box>
            ))
          ) : (
            <Typography>No QR Code found</Typography>
          )}

          {/* Action Buttons (Right Side) */}
          <Stack spacing={2} justifyContent="center">
            <Button
              variant="contained"
              onClick={handleDownloadQr}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
                background: "linear-gradient(to right, #6504C5, #4f46e5)",
                "&:hover": {
                  background: "linear-gradient(to right, #2563eb, #4338ca)",
                },
              }}
            >
              ⬇ Download
            </Button>

            <Button
              variant="outlined"
              onClick={handlePrintQr}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              🖨 Print
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}


import Tooltip from "@mui/material/Tooltip";
// import Typography from "@mui/material/Typography";
// import TableCell from "@mui/material/TableCell";

type AddressCellProps = {
  address: string;
};

export function AddressCell({ address }: AddressCellProps) {
  return (
    <TableCell sx={{ maxWidth: 200 }}>
      <Tooltip title={address} arrow>
        <Typography
          noWrap
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            cursor: "pointer",
          }}
        >
          {address}
        </Typography>
      </Tooltip>
    </TableCell>
  );
}