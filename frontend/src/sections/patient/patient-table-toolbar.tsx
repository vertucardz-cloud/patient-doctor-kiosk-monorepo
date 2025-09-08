import Tooltip from '@mui/material/Tooltip';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type UserTableToolbarProps = {
  numSelected: number;
};

export function PatientToolbar({ numSelected }: UserTableToolbarProps) {
  if (numSelected === 0) return null; 

  return (
    <Toolbar
      sx={{
        height: 96,
        display: 'flex',
        justifyContent: 'space-between',
        p: (theme) => theme.spacing(0, 1, 0, 3),
        color: 'primary.main',
        bgcolor: 'primary.lighter',
      }}
    >
      <Tooltip title="Delete">
        <IconButton>
          <Iconify icon="solar:trash-bin-trash-bold" />
        </IconButton>
      </Tooltip>
    </Toolbar>
  );
}
