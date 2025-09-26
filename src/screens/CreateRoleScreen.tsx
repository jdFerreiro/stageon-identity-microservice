import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { isTokenExpired } from "../lib/auth";
import api from '../services/api';
import { Box, TextField, Button, Alert, CircularProgress } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const CreateRoleScreen: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<{ name?: string; general?: string }>({});
  const [success, setSuccess] = useState('');
  const [processing, setProcessing] = useState(false);

  const ROLES_ENDPOINT = import.meta.env.VITE_API_ROLES || '/roles';
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (isTokenExpired(token)) {
      navigate("/login");
      return;
    }
    // Token expiration check
    const checkToken = async () => {
      const token = sessionStorage.getItem('token');
      try {
        await api.get(ROLES_ENDPOINT, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err: any) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          sessionStorage.removeItem('token');
          window.location.href = '/';
        }
      }
    };
    checkToken();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');
    if (!name.trim()) {
      setErrors({ name: 'El nombre es obligatorio' });
      return;
    }
    try {
      setProcessing(true);
      const token = sessionStorage.getItem('token');
      await api.post(ROLES_ENDPOINT, { name: name.trim() }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Rol creado correctamente');
      setTimeout(() => {
        window.location.href = '/roles';
      }, 1200);
    } catch (err: any) {
      if (err?.response?.data?.message) {
        setErrors({ general: `Error: ${err.response.data.message}` });
      } else {
        setErrors({ general: 'No se pudo crear el rol. Verifique los datos e intente nuevamente.' });
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box
      width="100%"
      maxWidth={500}
      mx="auto"
      mt={4}
      p={3}
      boxShadow={3}
      borderRadius={2}
      bgcolor="#fff"
      sx={{ overflowX: "hidden", border: '1px solid #e0e0e0', boxShadow: 3, position: 'relative' }}
    >
      {processing && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            bgcolor: 'rgba(255,255,255,0.7)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
          }}
        >
          <CircularProgress size={70} color="primary" thickness={5} />
        </Box>
      )}
      <form onSubmit={handleSubmit} autoComplete="off">
        <TextField
          type="text"
          label="Nombre"
          value={name}
          onChange={e => setName(e.target.value)}
          fullWidth
          margin="normal"
          error={!!errors.name}
          helperText={errors.name}
        />
        <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="medium"
            startIcon={<SaveIcon />}
            sx={{ minWidth: 120, fontWeight: 'bold' }}
          >
            Guardar
          </Button>
          <Button
            type="button"
            variant="outlined"
            color="error"
            size="medium"
            startIcon={<CancelIcon />}
            sx={{ minWidth: 120, fontWeight: 'bold' }}
            onClick={() => window.location.href = '/roles'}
          >
            Cancelar
          </Button>
        </Box>
      </form>
      {errors.general && <Alert severity="error" sx={{ mt: 2 }}>{errors.general}</Alert>}
      {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
    </Box>
  );
};

export default CreateRoleScreen;
