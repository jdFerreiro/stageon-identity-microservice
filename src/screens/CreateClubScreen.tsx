import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isTokenExpired } from "../lib/auth";
import api from "../services/api";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";
import Grid from "@mui/material/Grid";

type Club = {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
};

type CreateClubScreenProps = {
  onSuccess: () => void;
  onCancel: () => void;
  clubs?: Club[];
};


// ...existing code...

const CreateClubScreen: React.FC<CreateClubScreenProps> = ({ onSuccess, onCancel, clubs = [] }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    logo: ""
  });
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [logoError, setLogoError] = useState<string>("");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  // ...existing code...

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (isTokenExpired(token)) {
      navigate("/login");
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === "logo" && files && files[0]) {
      const file = files[0];
      // Validar tipo
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setLogoError("Solo se permiten imágenes PNG, JPG, JPEG, GIF o WEBP.");
        return;
      }
      // Validar tamaño (512 KB)
      const maxSize = 512 * 1024;
      if (file.size > maxSize) {
        setLogoError("La imagen no debe superar los 512 KB.");
        return;
      }
      setLogoError("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, logo: reader.result as string }));
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  setProcessing(true);
  setError("");
  setErrors({});
    // Validación frontend: nombre único (case-insensitive, trim)
    const normalizedName = form.name.trim().toLowerCase();
    const newErrors: { [key: string]: string } = {};
    if (!normalizedName) {
      newErrors.name = "El nombre del club es obligatorio.";
    } else if (form.name.trim().length < 3) {
      newErrors.name = "El nombre debe tener al menos 3 caracteres.";
    }
    if (form.description && form.description.trim().length > 0 && form.description.trim().length < 3) {
      newErrors.description = "La descripción debe tener al menos 3 caracteres si se indica.";
    }
    if (form.address && form.address.trim().length > 0 && form.address.trim().length < 3) {
      newErrors.address = "La dirección debe tener al menos 3 caracteres si se indica.";
    }
    if (form.phone && form.phone.trim().length > 0) {
      const phoneRegex = /^(\+\d{1,4}[ .]?)?(\d{2,5}[ .]?)?\d{5,10}$/;
      if (!phoneRegex.test(form.phone.trim().replace(/[-()]/g, ''))) {
        newErrors.phone = "El teléfono no tiene un formato válido. Ejemplo: +58 212 1234567 o 212.1234567";
      }
    }
    if (form.email && form.email.trim().length > 0) {
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(form.email.trim())) {
        newErrors.email = "El correo electrónico no tiene un formato válido.";
      }
    }
    const exists = clubs.some((club: Club) => club.name.trim().toLowerCase() === normalizedName);
    if (exists) {
      newErrors.name = "Ya existe un club con ese nombre.";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setProcessing(false);
      return;
    }
    // Enviar todos los campos del DTO, aunque estén vacíos
    const payload: any = {
      name: form.name.trim(),
      description: form.description.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      logo: form.logo || ""
    };
    try {
      const token = sessionStorage.getItem("token");
      await api.post(
        "/clubs",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
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
    <Paper sx={{ p: 3, maxWidth: 900, mx: 'auto', mt: 4 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
          {/* Columna izquierda: 75% */}
          <Box flex={{ xs: '1 1 100%', md: '0 1 75%' }} minWidth={0}>
            <TextField
              label="Nombre"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.name}
              helperText={errors.name}
            />
            <TextField
              label="Descripción"
              name="description"
              value={form.description}
              onChange={handleChange}
              fullWidth
              margin="normal"
              multiline
              minRows={3}
              error={!!errors.description}
              helperText={errors.description}
            />
            <TextField
              label="Dirección"
              name="address"
              value={form.address}
              onChange={handleChange}
              fullWidth
              margin="normal"
              multiline
              minRows={2}
              error={!!errors.address}
              helperText={errors.address}
            />
            <TextField
              label="Teléfono"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.phone}
              helperText={errors.phone}
            />
            <TextField
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              type="email"
              autoComplete="email"
              error={!!errors.email}
              helperText={errors.email}
            />
          </Box>
          {/* Columna derecha: 25% */}
          <Box flex={{ xs: '1 1 100%', md: '0 1 25%' }} minWidth={0} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
            <Box width="100%" display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ height: { md: 260 }, minHeight: 220 }}>
              {logoError && (
                <Typography color="error" variant="body2" mt={1}>{logoError}</Typography>
              )}
              {(logoPreview || form.logo) && !logoError ? (
                <Box width="100%" display="flex" justifyContent="center" alignItems="center" sx={{ height: 180 }}>
                  <img
                    src={logoPreview || form.logo}
                    alt="Logo preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: 180,
                      width: '100%',
                      height: '100%',
                      borderRadius: 8,
                      border: '1px solid #ccc',
                      objectFit: 'contain',
                      display: 'block',
                      margin: '0 auto'
                    }}
                  />
                </Box>
              ) : (
                <Box width="100%" height={180} display="flex" alignItems="center" justifyContent="center" sx={{ border: '1px dashed #ccc', borderRadius: 2, background: '#fafafa' }}>
                  <Typography variant="caption" color="textSecondary">Sin logo</Typography>
                </Box>
              )}
              <Button variant="outlined" component="label" sx={{ mt: 2, width: '100%' }}>
                Cargar Logo
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                  name="logo"
                  hidden
                  onChange={handleChange}
                />
              </Button>
            </Box>
          </Box>
        </Box>
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
    </Paper>
  );
};

export default CreateClubScreen;