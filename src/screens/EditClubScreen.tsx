import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isTokenExpired } from "../lib/auth";
  const navigate = useNavigate();
import api from "../services/api";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";

type EditClubScreenProps = {
  clubId: string;
  onSuccess: () => void;
  onCancel: () => void;
};

const EditClubScreen: React.FC<EditClubScreenProps> = ({ clubId, onSuccess, onCancel }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
  });
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (isTokenExpired(token)) {
      navigate("/login");
      return;
    }
    const fetchClub = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/clubs/${clubId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setForm({
          name: res.data.name || "",
          description: res.data.description || "",
          address: res.data.address || "",
          phone: res.data.phone || "",
          email: res.data.email || "",
        });
      } catch {
        setError("No se pudo cargar el club.");
      } finally {
        setLoading(false);
      }
    };
    fetchClub();
  }, [clubId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      await api.patch(
        `/clubs/${clubId}`,
        { ...form },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        "No se pudo editar el club. Verifique los datos."
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
        Editar Club
      </Typography>
      <TextField
        label="Nombre"
        name="name"
        value={form.name}
        onChange={handleChange}
        fullWidth
        required
        margin="normal"
      />
      <TextField
        label="Descripción"
        name="description"
        value={form.description}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Dirección"
        name="address"
        value={form.address}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Teléfono"
        name="phone"
        value={form.phone}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Email"
        name="email"
        value={form.email}
        onChange={handleChange}
        fullWidth
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

export default EditClubScreen;