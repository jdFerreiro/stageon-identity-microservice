import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { isTokenExpired } from "../lib/auth";
import api from "../services/api";
import CreateClubUsuario from './CreateClubUsuario';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EditClubUsuario from './EditClubUsuario';
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

interface UserClub {
  id: string; // id de la relación
  clubId: string;
  memberNumber: string;
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
  const [clubes, setClubes] = useState<(Club & { memberNumber?: string; userClubId?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAgregar, setOpenAgregar] = useState(false);
  const [editClub, setEditClub] = useState<{ clubId: string; memberNumber: string; clubName: string; userClubId?: string } | null>(null);


  const fetchClubes = async () => {
    try {
      setLoading(true);
      // Get clubs info
      const userRes = await api.get<User>(`/users/${usuarioId}`);
      const clubs: Club[] = userRes.data.clubs || [];
      // Get user-club associations (for memberNumber)
      const userClubRes = await api.get<UserClub[]>(`/user-club/user/${usuarioId}`);
      const userClubs: UserClub[] = userClubRes.data || [];
      // Merge memberNumber and userClubId into clubs (robust to multiple relations and backend field names)
      const clubsWithMember = clubs.map(club => {
        const found = Array.isArray(userClubs)
          ? userClubs.find((uc: any) => uc.clubId === club.id)
          : undefined;
        // Cast a any para acceder a posibles campos alternativos
        const anyFound = found as any;
        return {
          ...club,
          memberNumber: found?.memberNumber || '',
          userClubId: found ? (found.id || anyFound?._id || anyFound?.userClubId || anyFound?.user_club_id) : undefined
        };
      });
      setClubes(clubsWithMember);
    } catch {
      setClubes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Verificar expiración de token
    const token = sessionStorage.getItem("token");
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

  // ...
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
            <strong style={{ width: '30%' }}>
              {club.name}
              {club.memberNumber && (
                <span style={{ color: '#888', fontWeight: 'normal', marginLeft: 8, fontSize: 14 }}>
                  (Nº socio: {club.memberNumber})
                </span>
              )}
            </strong>
            {club.description && <span style={{ width: '40%' }}>{club.description}</span>}
            <IconButton
              aria-label="Editar club"
              color="primary"
              size="small"
              onClick={() => setEditClub({ clubId: club.id, memberNumber: club.memberNumber || '', clubName: club.name, userClubId: club.userClubId })}
              sx={{ ml: 1 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
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
      {/* Modal de edición de número de socio */}
      <Dialog open={!!editClub} onClose={() => setEditClub(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Editar número de socio</DialogTitle>
        <DialogContent>
          {editClub ? (
            <EditClubUsuario
              clubId={editClub.clubId}
              clubName={editClub.clubName}
              initialMemberNumber={editClub.memberNumber}
              userClubId={editClub.userClubId}
              onSuccess={() => {
                setEditClub(null);
                setLoading(true);
                fetchClubes();
              }}
              onCancel={() => setEditClub(null)}
            />
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditClub(null)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
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