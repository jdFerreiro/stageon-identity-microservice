import React, { useState } from "react";
import api from "../services/api";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";

type CreateClubScreenProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

const CreateClubScreen: React.FC<CreateClubScreenProps> = ({ onSuccess, onCancel }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
  });
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

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
      await api.post(
        "/clubs",
        { ...form },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        "No se pudo crear el club. Verifique los datos."
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="h6" mb={2}>
        Crear Club
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
          {processing ? <CircularProgress size={24} /> : "Crear"}
        </Button>
        <Button variant="outlined" onClick={onCancel} disabled={processing}>
          Cancelar
        </Button>
      </Box>
    </Box>
  );
};

export default CreateClubScreen;