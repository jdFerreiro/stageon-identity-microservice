import React, { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isTokenExpired } from "../lib/auth";
import api from "../services/api";
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";

type CreateUserTypeScreenProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

const CreateUserTypeScreen: React.FC<CreateUserTypeScreenProps> = ({ onSuccess, onCancel }) => {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (isTokenExpired(token)) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/user-types",
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        "No se pudo crear el tipo de usuario."
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
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
          {processing ? <CircularProgress size={24} /> : "Crear"}
        </Button>
        <Button variant="outlined" onClick={onCancel} disabled={processing}>
          Cancelar
        </Button>
      </Box>
    </Box>
  );
};

export default CreateUserTypeScreen;