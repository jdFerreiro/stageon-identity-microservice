import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { isTokenExpired } from "../lib/auth";
import api from "../services/api";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";

type EditUserTypeScreenProps = {
  userTypeId: string;
  onSuccess: () => void;
  onCancel: () => void;
};

const EditUserTypeScreen: React.FC<EditUserTypeScreenProps> = ({ userTypeId, onSuccess, onCancel }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserType = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await api.get(`/user-types/${userTypeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setName(res.data.name || "");
      } catch {
        setError("No se pudo cargar el tipo de usuario.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserType();
  }, [userTypeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError("");
    try {
      const token = sessionStorage.getItem("token");
      await api.patch(
        `/user-types/${userTypeId}`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        "No se pudo editar el tipo de usuario."
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="h6" mb={2}>
        Editar Tipo de Usuario
      </Typography>
      <TextField
        label="Nombre del Tipo"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        required
        margin="normal"
      />
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      <Box mt={3} display="flex" gap={2}>
        <Button type="submit" variant="contained" color="primary" disabled={processing}>
          {processing ? <CircularProgress size={24} /> : "Guardar"}
        </Button>
        <Button variant="outlined" onClick={onCancel} disabled={processing}>
          Cancelar
        </Button>
      </Box>
    </Box>
  );
};

export default EditUserTypeScreen;