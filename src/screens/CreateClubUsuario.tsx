import React, { useEffect, useState } from "react";
import { Box, Button, MenuItem, Select, InputLabel, FormControl, CircularProgress, Alert } from "@mui/material";

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

  useEffect(() => {
    fetch("/clubs")
      .then(res => res.json())
      .then((data: Club[]) => {
        setClubes(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleAddClub = async () => {
    setProcessing(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      await fetch(`/users/${usuarioId}/clubs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ clubId: selectedClubId }),
      });
      onSuccess();
    } catch {
      setError("No se pudo agregar el club.");
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
      {error && <Alert severity="error">{error}</Alert>}
      <Box mt={2} display="flex" gap={2}>
        <Button
          variant="contained"
          color="primary"
          disabled={!selectedClubId || processing}
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