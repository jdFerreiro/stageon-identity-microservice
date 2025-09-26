import React, { useState } from "react";
import { Box, Button, TextField, DialogActions, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import api from "../services/api";

interface Props {
  clubId: string;
  clubName?: string;
  initialMemberNumber: string;
  userClubId?: string; // id de la relación usuario-club
  onSuccess: () => void;
  onCancel: () => void;
}

const EditClubUsuario: React.FC<Props> = ({ clubId, clubName, initialMemberNumber, userClubId, onSuccess, onCancel }) => {
  const [memberNumber, setMemberNumber] = useState(initialMemberNumber);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError("");
    if (!memberNumber.trim()) {
      setError("El número de socio es obligatorio.");
      setProcessing(false);
      return;
    }
    try {
      // PATCH /user-club/{id} { memberNumber }
      if (!userClubId) {
        setError("No se encontró la relación usuario-club.");
        setProcessing(false);
        return;
      }
      await api.patch(`/user-club/${userClubId}`, { memberNumber });
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || "No se pudo actualizar el número de socio.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <FormControl fullWidth margin="normal" disabled>
        <InputLabel id="club-label">Club</InputLabel>
        <Select labelId="club-label" value={clubId} label="Club">
          <MenuItem value={clubId}>{clubName || clubId}</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Número de socio"
        value={memberNumber}
        onChange={e => setMemberNumber(e.target.value)}
        fullWidth
        required
        margin="normal"
        inputProps={{ maxLength: 30 }}
      />
      {error && <Alert severity="error">{error}</Alert>}
      <DialogActions>
        <Button type="submit" variant="contained" color="primary" disabled={processing}>
          {processing ? <CircularProgress size={24} /> : "Guardar"}
        </Button>
        <Button variant="outlined" onClick={onCancel} disabled={processing}>
          Cancelar
        </Button>
      </DialogActions>
    </Box>
  );
};

export default EditClubUsuario;
