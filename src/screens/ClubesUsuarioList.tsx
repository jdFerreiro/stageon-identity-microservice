import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton } from "@mui/material";
import CreateClubUsuario from './CreateClubUsuario';
import DeleteIcon from '@mui/icons-material/Delete';

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
  const [clubes, setClubes] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAgregar, setOpenAgregar] = useState(false);

  const fetchClubes = () => {
    fetch(`/users/${usuarioId}`)
      .then(res => res.json())
      .then((data: User) => {
        setClubes(data.clubs || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchClubes();
    // eslint-disable-next-line
  }, [usuarioId]);

  const handleRemoveClub = async (clubId: string) => {
    const token = localStorage.getItem("token");
    await fetch(`/users/${usuarioId}/clubs/${clubId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    fetchClubes();
  };

  if (loading) return <div>Cargando clubes...</div>;

  return (
    <div>
      <h2>Clubes a los que perteneces</h2>
      <Button variant="contained" color="primary" onClick={() => setOpenAgregar(true)}>
        Agregar club
      </Button>
      <ul>
        {clubes.map(club => (
          <li key={club.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <strong>{club.name}</strong>
            {club.description && <>: {club.description}</>}
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