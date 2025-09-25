import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { isTokenExpired } from "../lib/auth";
import api from "../services/api";
import CreateClubUsuario from './CreateClubUsuario';
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';

interface Club {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  logo?: string;
  email?: string;
}

interface User {
  id: string;
  clubs: Club[];
}

interface Props {
  usuarioId: string;
}

const ClubesUsuarioList: React.FC<Props> = ({ usuarioId }) => {
  const navigate = useNavigate();
  const [clubes, setClubes] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAgregar, setOpenAgregar] = useState(false);

  const fetchClubes = () => {
    api.get<User>(`/users/${usuarioId}`)
      .then(res => {
        setClubes(res.data.clubs || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    // Verificar expiración de token
    const token = localStorage.getItem("token");
    if (isTokenExpired(token)) {
      navigate("/login");
      return;
    }
    fetchClubes();
    // eslint-disable-next-line
  }, [usuarioId]);

  const handleRemoveClub = async (clubId: string) => {
  await api.delete(`/user-club`, { data: { userId: usuarioId, clubId } });
  fetchClubes();
  };

  if (loading) return <div>Cargando clubes...</div>;

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Tooltip title="Agregar" arrow>
          <IconButton color="primary" onClick={() => setOpenAgregar(true)}>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </span>
          </IconButton>
        </Tooltip>
      </div>
      <ul style={{ minWidth: 600, padding: 0, margin: 0, listStyle: 'none' }}>
        {clubes.map(club => (
          <li
            key={club.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              minWidth: 600,
              borderBottom: '1px solid #e0e0e0',
              padding: '12px 0',
            }}
          >
            <strong style={{ width: '30%' }}>{club.name}</strong>
            {club.description && <span style={{ width: '40%' }}>{club.description}</span>}
            <IconButton
              aria-label="Eliminar club"
              color="error"
              size="small"
              onClick={() => handleRemoveClub(club.id)}
              sx={{ ml: 1 }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </li>
        ))}
      </ul>
      <Dialog open={openAgregar} onClose={() => setOpenAgregar(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar club al usuario</DialogTitle>
        <DialogContent>
          <CreateClubUsuario
            usuarioId={usuarioId}
            onSuccess={() => {
              setOpenAgregar(false);
              setLoading(true);
              fetchClubes();
            }}
            onCancel={() => setOpenAgregar(false)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAgregar(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ClubesUsuarioList;