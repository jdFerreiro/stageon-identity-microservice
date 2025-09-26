import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import { Box, Button, MenuItem, Select, InputLabel, FormControl, CircularProgress, Alert, TextField } from "@mui/material";
import api from "../services/api";

interface Club {
  id: string;
  name: string;
}

interface Props {
  usuarioId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const CreateClubUsuario: React.FC<Props> = ({ usuarioId, onSuccess, onCancel }) => {
  const [clubes, setClubes] = useState<Club[]>([]);
  const [selectedClubId, setSelectedClubId] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [userClubs, setUserClubs] = useState<string[]>([]);
  const [numeroSocio, setNumeroSocio] = useState("");

  useEffect(() => {
    // Obtener todos los clubes
    api.get<Club[]>("/clubs")
      .then(res => {
        setClubes(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Obtener clubes del usuario
    api.get(`/user-club/user/${usuarioId}`)
      .then(res => {
        // res.data es un array de relaciones { clubId, ... }
        setUserClubs(res.data.map((rel: any) => rel.clubId));
      })
      .catch(() => setUserClubs([]));
  }, []);

  const handleAddClub = async () => {
    setProcessing(true);
    setError("");
    if (!numeroSocio.trim()) {
      setError("El número de socio es obligatorio.");
      setProcessing(false);
      return;
    }
    // Verificar si ya está asociado
    if (userClubs.includes(selectedClubId)) {
      setError("El club ya está asociado al usuario.");
      setProcessing(false);
      return;
    }
    try {
  await api.post(`/user-club`, { userId: usuarioId, clubId: selectedClubId, memberNumber: numeroSocio });
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || "No se pudo agregar el club.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <FormControl fullWidth margin="normal">
        <InputLabel id="club-label">Selecciona un club</InputLabel>
        <Select
          labelId="club-label"
          value={selectedClubId}
          label="Selecciona un club"
          onChange={e => setSelectedClubId(e.target.value)}
        >
          {clubes.map(club => (
            <MenuItem key={club.id} value={club.id}>
              {club.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="Número de socio"
        value={numeroSocio}
        onChange={e => setNumeroSocio(e.target.value)}
        fullWidth
        required
        margin="normal"
        inputProps={{ maxLength: 30 }}
      />
      {error && <Alert severity="error">{error}</Alert>}
      <Box mt={2} display="flex" gap={2}>
        <Button
          variant="contained"
          color="primary"
          disabled={!selectedClubId || !numeroSocio.trim() || processing}
          onClick={handleAddClub}
        >
          {processing ? <CircularProgress size={24} /> : "Agregar"}
        </Button>
        <Button variant="outlined" onClick={onCancel} disabled={processing}>
          Cancelar
        </Button>
      </Box>
    </Box>
  );
};

export default CreateClubUsuario;