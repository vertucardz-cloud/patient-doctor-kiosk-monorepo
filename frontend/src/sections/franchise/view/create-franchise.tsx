import type { Franchise, FranchiseDto, UpdateFranchiseDto, CreateFranchiseDto } from 'src/services/franchise/franchise.service';

import { toast } from 'react-toastify';
import React, { useState, useEffect } from 'react';

import {
  Stack,
  Dialog,
  Button,
  TextField,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';

import franchiseService from 'src/services/franchise/franchise.service';

import { Iconify } from 'src/components/iconify';

import { formFields } from '../data/formFieldsData';

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: (data: Franchise) => void;
  initialData?: Franchise | null;
};

const FormFieldsDialog: React.FC<Props> = ({ open, onClose, onSuccess, initialData }) => {

  const [formData, setFormData] = useState<FranchiseDto>({
    name: '',
    address: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    country: '',
    postalCode: ''
  } as FranchiseDto);
  const [loading, setLoading] = useState(false);

  // Prefill for edit mode
  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...rest } = initialData;
      setFormData(rest as FranchiseDto);
    } else {
      setFormData({
        name: '',
        address: '',
        email: '',
        phone: '',
        city: '',
        state: '',
        country: '',
        postalCode: ''
      } as FranchiseDto);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


const handleSave = async () => {
  setLoading(true);
  try {
    const dto: CreateFranchiseDto = {
      name: formData.name, 
      address: formData.address,
      email: formData.email,
      phone: formData.phone,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      postalCode: formData.postalCode,
    };

    const updateDto: UpdateFranchiseDto = { ...dto };

    if (initialData) {
      await franchiseService.updateFranchise(initialData.id, updateDto);
      onSuccess({ ...initialData, ...updateDto }); 
      toast.success("Franchise updated successfully!");
    } else {
      const newId = crypto.randomUUID();
      onSuccess({
        ...dto,
        id: newId,
        isActive: true 
      });
      await franchiseService.createFranchise(dto);
    }
    

    onClose();
  } catch (err) {
    toast.error("Failed to save franchise.");
    console.error('Error saving franchise:', err);
  } finally {
    setLoading(false);
  }
};

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? 'Edit Franchise' : 'New Franchise'} 

     <IconButton
              aria-label="close"
              onClick={onClose}
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

      <DialogContent dividers>
        <Stack spacing={2}>
          {formFields.map((field) => (
            <TextField
              key={field.id}
              label={field.label}
              name={field.id}
              value={(formData as any)[field.id] || ''}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />
          ))}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="secondary">
          Close
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} /> : null}
        >
          {initialData ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
};

export default FormFieldsDialog;
