import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isTokenExpired } from '../lib/auth';
import api from '../services/api';
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
  Alert,
  Stack,
  TextField,
  CircularProgress
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

interface EditRoleScreenProps {
  id: string;
}

const EditRoleScreen: React.FC<EditRoleScreenProps> = ({ id }) => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  const ROLES_ENDPOINT = import.meta.env.VITE_API_ROLES || '/roles';
  useEffect(() => {
    // Token expiration check
    const token = localStorage.getItem('token');
    if (isTokenExpired(token)) {
      localStorage.removeItem('token');
      navigate('/login');
      return;
    }
    const fetchRole = async () => {
      const token = localStorage.getItem('token');
      const response = await api.get(`${ROLES_ENDPOINT}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsActive(response.data.isActive);
      setName(response.data.name || '');
    };
    fetchRole();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      await api.patch(
        `${ROLES_ENDPOINT}/${id}`,
        { name: name.trim(), isActive },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      window.location.href = '/roles';
    } catch (err: any) {
      setError('Error al actualizar rol');
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
      sx={{ overflowX: 'hidden', border: '1px solid #e0e0e0', boxShadow: 3, position: 'relative' }}
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
      <Typography variant="h5" mb={2}>
        Editar Rol
      </Typography>
      <form onSubmit={handleSubmit}>
        <Typography variant="subtitle1" mb={1}>Nombre del Rol</Typography>
        <Box mb={2}>
          <TextField
            type="text"
            label="Nombre"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            fullWidth
            margin="normal"
            autoComplete="off"
          />
        </Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
            />
          }
          label="Activo"
        />
        <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
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
        </Stack>
      </form>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default EditRoleScreen;
