"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  ChangeEvent,
  useCallback,
} from "react";
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CustomTextField from "@/components/common/CustomTextField";

export interface WalletCreateDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: {
    name: string;
    description: string;
  }) => Promise<void> | void;
  existingNames?: string[];
}

type SubmitErrorField = "name" | "description" | "form";

const fieldForMessage = (message: string): SubmitErrorField => {
  if (/already exists|wallet can only contain/i.test(message)) return "name";
  if (/about/i.test(message)) return "description";
  return "form";
};

const WalletCreateDrawer: React.FC<WalletCreateDrawerProps> = ({
  open,
  onClose,
  onCreate,
  existingNames = [],
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<{
    field: SubmitErrorField;
    message: string;
  } | null>(null);

  const isDirty = Boolean(name.trim() || description.trim());

  useEffect(() => {
    setName("");
    setDescription("");
    setConfirmOpen(false);
    setSubmitError(null);
    setIsSubmitting(false);
  }, [open]);

  const normalize = (s: string) => s.trim().toLowerCase();

  const isDuplicate = useMemo(() => {
    if (!name.trim()) return false;
    const norm = normalize(name);
    return existingNames.some((n) => normalize(n) === norm);
  }, [name, existingNames]);

  const canSubmit = Boolean(name.trim() && description.trim() && !isDuplicate);

  const handleCreate = async () => {
    if (!canSubmit || isSubmitting) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await onCreate({ name: name.trim(), description: description.trim() });
      onClose();
    } catch (e) {
      const message =
        e instanceof Error && e.message
          ? e.message
          : "Could not create the wallet. Please try again.";
      setSubmitError({ field: fieldForMessage(message), message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseRequest = useCallback(() => {
    if (isDirty) {
      setConfirmOpen(true);
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  const handleKeep = () => setConfirmOpen(false);

  const handleDiscard = () => {
    setName("");
    setDescription("");
    setConfirmOpen(false);
    onClose();
  };

  return (
    <>
      <Drawer
        anchor="bottom"
        open={open}
        onClose={handleCloseRequest}
        aria-labelledby="wallet-create-drawer-title"
        PaperProps={{
          sx: {
            borderTopLeftRadius: 3,
            borderTopRightRadius: 3,
            pb: 2,
            maxWidth: 560,
            mx: "auto",
            width: "100%",
          },
        }}
      >
        <Box sx={{ p: 2.5, pb: 1.5, display: "flex", alignItems: "center" }}>
          <Typography
            id="wallet-create-drawer-title"
            variant="h6"
            sx={{ fontWeight: 600, flex: 1, letterSpacing: 0.2 }}
          >
            Provide wallet details
          </Typography>
          <IconButton aria-label="close" onClick={handleCloseRequest}>
            <CloseRoundedIcon />
          </IconButton>
        </Box>
        <Divider />

        <Box sx={{ p: 2.5 }}>
          <CustomTextField
            label="Name"
            name="name"
            required
            placeholder="Name"
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setName(e.target.value);
              setSubmitError(null);
            }}
            testId="wallet-create-name"
            error={isDuplicate || submitError?.field === "name"}
            helperText={
              isDuplicate
                ? "Wallet name should be unique."
                : submitError?.field === "name"
                  ? submitError.message
                  : undefined
            }
          />

          <CustomTextField
            label="Description"
            name="description"
            required
            placeholder="This text will be visible when you share your wallet."
            value={description}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setDescription(e.target.value);
              setSubmitError(null);
            }}
            testId="wallet-create-description"
            error={submitError?.field === "description"}
            helperText={
              submitError?.field === "description"
                ? submitError.message
                : undefined
            }
          />

          {submitError?.field === "form" && (
            <Typography
              variant="body2"
              color="error"
              data-test="wallet-create-error"
              sx={{ mt: 0.5 }}
            >
              {submitError.message}
            </Typography>
          )}

          <Button
            data-test="wallet-create-submit"
            fullWidth
            size="large"
            variant="contained"
            disabled={!canSubmit || isSubmitting}
            onClick={handleCreate}
            sx={{
              mt: 1.5,
              ":disabled": { backgroundColor: "#E0E0E0", color: "#9E9E9E" },
              textTransform: "uppercase",
            }}
          >
            Create Wallet
          </Button>
        </Box>
      </Drawer>

      <Dialog
        open={confirmOpen}
        onClose={handleKeep}
        aria-labelledby="discard-dialog-title"
      >
        <DialogTitle id="discard-dialog-title" sx={{ fontWeight: 600 }}>
          Discard changes?
        </DialogTitle>
        <DialogContent sx={{ pt: 1, pb: 0 }}>
          <Typography variant="body1">
            Are you sure you want to discard the new wallet?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleKeep} variant="text" sx={{ fontWeight: 600 }}>
            KEEP CHANGES
          </Button>
          <Button
            onClick={handleDiscard}
            variant="outlined"
            color="error"
            sx={{ fontWeight: 600 }}
          >
            DISCARD
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WalletCreateDrawer;
