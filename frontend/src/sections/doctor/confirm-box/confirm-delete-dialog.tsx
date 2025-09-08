import { toast } from "react-toastify";
// src/components/common/ConfirmDeleteDialog.tsx
import React, { useState } from "react";

import {
  Dialog,
  Button,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

type ConfirmDeleteDialogProps = {
  open: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  doctorName?: string
};


export default function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  doctorName
}: ConfirmDeleteDialogProps) {
  const [loading, setLoading] = useState(false);



 const handleConfirm = async () => {
  try {
    setLoading(true);
    await onConfirm(); // this must throw on error
    toast.success(
      doctorName
        ? `Doctor "${doctorName}" deleted successfully`
        : "Deleted successfully"
    );
    onClose();
  } catch (error: any) {
    console.error("Delete error:", error);
    toast.error(
      doctorName
        ? `Failed to delete doctor "${doctorName}" (${error?.response?.status || "error"})`
        : "Delete failed"
    );
  } finally {
    setLoading(false);
  }
};



  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete{" "}
          <strong>{doctorName || "this record"}</strong>?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleConfirm} 
          disabled={loading}
        >
          {loading ? "Deleting..." : "Yes, Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
