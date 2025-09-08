// import type { User, UpdateUserDto, CreateUserDto } from 'src/services/user/user.service';

// import { toast } from 'react-toastify';
// import React, { useState, useEffect } from 'react';

// import {
//     Stack,
//     Dialog,
//     Button,
//     TextField,
//     IconButton,
//     DialogTitle,
//     DialogContent,
//     DialogActions,
//     CircularProgress
// } from '@mui/material';

// import userService from 'src/services/user/user.service';

// import { Iconify } from 'src/components/iconify';

// import { formFields, updadteformFields } from '../data/formFieldData';

// type Props = {
//     open: boolean;
//     onClose: () => void;
//     onSuccess: (data: User) => void;
//     initialData?: Partial<User> | null;
// };

// const FormFieldsDialog: React.FC<Props> = ({ open, onClose, onSuccess, initialData }) => {
//     console.log('-----------------open------------------', open)
//     console.log('-----------------initialData------------------', initialData)


//     const dynamicFormField = initialData ? updadteformFields : formFields;

//     const [formData, setFormData] = useState<CreateUserDto>({
//         username: '',
//         email: '',
//         password: '',
//     } as CreateUserDto);
//     const [loading, setLoading] = useState(false);

//     // Prefill for edit mode
//     useEffect(() => {
//         if (initialData) {
//             // eslint-disable-next-line @typescript-eslint/no-unused-vars
//             const { id, ...rest } = initialData;
//             setFormData(rest as CreateUserDto);
//         } else {
//             setFormData({
//                 username: '',
//                 email: '',
//                 password: '',
//             } as CreateUserDto);
//         }
//     }, [initialData]);

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//     };


//     const handleSave = async () => {
//         setLoading(true);
//         try {
//             const dto: CreateUserDto = {
//                 username: formData.username,
//                 email: formData.email,
//                 password: formData.password,
//             };

//             const updateDto: UpdateUserDto = { ...dto };

//             if (initialData && initialData.id) {
//                 await userService.updateUser(initialData.id, updateDto);
//                 onSuccess({
//                     id: initialData.id as string,
//                     username: formData.username || '',
//                     email: formData.email || '',
//                     role: initialData.role ?? 'user',
//                     status: initialData.status ?? '',
//                     avatarUrl: initialData.avatarUrl ?? '',
//                     isVerified: initialData.isVerified ?? false,
//                     createdAt: initialData.createdAt ?? '',
//                     updatedAt: initialData.updatedAt ?? '',
//                 });
//                 toast.success("User updated successfully!");
//             } else {
//                 const createdUser = await userService.createUser(dto);
//                 onSuccess(createdUser);
//                 toast.success("User created successfully!");
//             }


//             onClose();
//         } catch (err) {
//             toast.error("Failed to save franchise.");
//             console.error('Error saving franchise:', err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
//             <DialogTitle>{initialData ? 'Edit User' : 'New User'}

//                 <IconButton
//                     aria-label="close"
//                     onClick={onClose}
//                     sx={{
//                         position: "absolute",
//                         top: 8,
//                         right: 8,
//                         color: (theme) => theme.palette.grey[500],
//                     }}
//                 >
//                     <Iconify icon={"eva:close-fill" as any} width={20} height={20} />
//                 </IconButton>

//             </DialogTitle>

//             <DialogContent dividers>
//                 <Stack spacing={2}>
//                     {dynamicFormField.map((field) => (
//                         <TextField
//                             key={field.id}
//                             label={field.label}
//                             type={field.id === 'password' ? 'password' : 'text'}
//                             name={field.id}
//                             value={(formData as any)[field.id] || ''}
//                             onChange={handleChange}
//                             fullWidth
//                             variant="outlined"
//                         />
//                     ))}
//                 </Stack>
//             </DialogContent>

//             <DialogActions>
//                 <Button onClick={onClose} variant="outlined" color="secondary">
//                     Close
//                 </Button>
//                 <Button
//                     variant="contained"
//                     color="primary"
//                     onClick={handleSave}
//                     disabled={loading}
//                     startIcon={loading ? <CircularProgress size={18} /> : null}
//                 >
//                     {initialData ? 'Update' : 'Save'}
//                 </Button>
//             </DialogActions>
//         </Dialog>
//     )
// };

// export default FormFieldsDialog;

import axios from 'axios';
import React, { useState } from "react";
import {QRCodeCanvas} from "qrcode.react";


const UPIPayment: React.FC<{ amount: number }> = ({ amount }) => {
  const [qrLink, setQrLink] = useState<string | null>(null);

  const createUPIQR = async () => {
    const { data } = await axios.post("http://localhost:5000/api/create-upi-qr", { amount });
    setQrLink(data.qrLink);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <button
        onClick={createUPIQR}
        style={{
          padding: "10px 20px",
          background: "#25d366",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Pay ₹{amount} via UPI QR
      </button>

      {qrLink && (
        <div style={{ marginTop: "20px" }}>
          <h3>Scan this QR Code with any UPI App</h3>
          <QRCodeCanvas value={qrLink} size={200} />
          <p style={{ marginTop: "10px" }}>UPI Link: {qrLink}</p>
        </div>
      )}
    </div>
  );
};

export default UPIPayment;

