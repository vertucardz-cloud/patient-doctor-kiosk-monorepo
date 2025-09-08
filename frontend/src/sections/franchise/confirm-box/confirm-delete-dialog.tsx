import type { TransitionProps } from "@mui/material/transitions";

// src/components/common/ConfirmDeleteDialog.tsx
import React from "react";
import { toast } from "react-toastify";

import {
  Slide,
  Dialog,
  Button,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type ConfirmDeleteDialogProps = {
  open: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

export default function ConfirmDeleteDialog({
  open,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete this franchise?",
  onClose,
  onConfirm,
}: ConfirmDeleteDialogProps) {

  const handleConfirm = async () => {
    try {
      await onConfirm();
      toast.success("Franchise deleted successfully!");
      onClose();
    } catch (err) {
      toast.error("Failed to delete franchise.");
      console.error(err);
    }
  };

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>
        {title}
      </DialogTitle>
      <DialogContent sx={{ textAlign: "center", py: 2 }}>
        <Typography variant="body1">{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 2 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          No
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          onClickCapture={handleConfirm}
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
