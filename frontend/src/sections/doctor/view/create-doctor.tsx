import type { Doctor, DoctorDto, CreateDoctorDto, UpdateDoctorDto} from 'src/services/doctor/doctor.service';

import { toast } from 'react-toastify';
import React, { useState, useEffect } from 'react';

import IconButton from '@mui/material/IconButton';
import {
  Stack,
  Dialog,
  Button,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import DoctorService from 'src/services/doctor/doctor.service';

import { Iconify } from 'src/components/iconify';

import { formFields } from '../data/formFieldsData';


type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: (data: Doctor) => void;
  initialData?: Doctor | null;
};

const FormFieldsDialog: React.FC<Props> = ({ open, onClose, onSuccess, initialData }) => {

  const [formData, setFormData] = useState<DoctorDto>({
    name: '',
    username: '',
    password: '',
    phone: '',
    specialty: '',
    email: '',
    isActive: true,
  } as DoctorDto);
  const [loading, setLoading] = useState(false);

  // Prefill for edit mode
  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...rest } = initialData;
      setFormData(rest as DoctorDto);
    } else {
      setFormData({
        name: '',
        username: '',
        password: '',
        phone: '',
        specialty: '',
        email: '',
        isActive: true,
      } as DoctorDto);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleSave = async () => {
    setLoading(true);
    try {
      const dto: CreateDoctorDto = {
        name: formData.name,
        username: formData.username,
        password: formData.password,
        specialty: formData.specialty,
        email: formData.email,
        phone: formData.phone,
       
      };

      const updateDto: UpdateDoctorDto = { ...dto };

      if (initialData) {
        await DoctorService.updateDoctor(initialData.id, updateDto);
        onSuccess({ ...initialData, ...updateDto });
        toast.success("Doctor updated successfully!");
      } else {
        const doctor = await DoctorService.createDoctor(dto);
        onSuccess(doctor);
      }


      onClose();
    } catch (err) {
      toast.error("Failed to save Doctor.");
      console.error('Error saving Doctor:', err);
    } finally {
      setLoading(false);
    }
  };


  return (


    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? 'Edit Doctor' : 'New Doctor'}

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
