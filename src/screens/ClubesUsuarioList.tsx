import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton } from "@mui/material";
import Box from '@mui/material/Box';
// import { useNavigate } from "react-router-dom";
// import { isTokenExpired } from "../lib/auth";
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
    <Box width="100%" minHeight="100vh" bgcolor="#f5f5f5" p={{ xs: 1, sm: 2, md: 3 }} display="flex" flexDirection="column" alignItems="center" sx={{ boxSizing: 'border-box', position: 'relative', overflow: 'visible' }}>
      <Box width="100%" maxWidth={1000} mx="auto" mb={3} display="flex" justifyContent="flex-end" alignItems="center" sx={{ boxSizing: 'border-box' }}>
        <Tooltip title="Agregar" arrow>
          <IconButton color="primary" onClick={() => setOpenAgregar(true)}>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </span>
          </IconButton>
        </Tooltip>
      </Box>
      <Box width="100%" maxWidth={1000} mx="auto" flex={1} sx={{ boxSizing: 'border-box', overflow: 'visible', minHeight: 300, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
        <Box component="ul" sx={{ width: '100%', p: 0, m: 0, listStyle: 'none' }}>
          {clubes.map(club => (
            <Box
              component="li"
              key={club.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1, sm: 2 },
                borderBottom: '1px solid #e0e0e0',
                py: 1.5,
                px: { xs: 0, sm: 1 },
                minWidth: 0,
                flexWrap: { xs: 'wrap', sm: 'nowrap' },
              }}
            >
              {/* Logo club */}
              <Box sx={{ width: { xs: 48, sm: 64 }, height: { xs: 48, sm: 64 }, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: { xs: 1, sm: 2 } }}>
                {club.logo ? (
                  <Box component="img" src={club.logo} alt={club.name} sx={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 2, bgcolor: '#fff', border: '1px solid #eee', boxShadow: 1 }} />
                ) : (
                  <Box sx={{ width: '100%', height: '100%', borderRadius: 2, bgcolor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 24, fontWeight: 700 }}>
                    {club.name?.[0] || '?'}
                  </Box>
                )}
              </Box>
              {/* Datos club */}
              <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 0.5, sm: 2 } }}>
                <Box sx={{ fontWeight: 700, fontSize: { xs: 16, sm: 18 }, width: { xs: '100%', sm: '30%' }, minWidth: 0, wordBreak: 'break-word' }}>
                  {club.name}
                  {club.memberNumber && (
                    <Box component="span" sx={{ color: '#888', fontWeight: 400, ml: 1, fontSize: { xs: 13, sm: 14 } }}>
                      (Nº socio: {club.memberNumber})
                    </Box>
                  )}
                </Box>
                {club.description && (
                  <Box sx={{ width: { xs: '100%', sm: '40%' }, color: '#555', fontSize: { xs: 14, sm: 16 }, minWidth: 0, wordBreak: 'break-word' }}>{club.description}</Box>
                )}
              </Box>
              {/* Acciones */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: { xs: 0, sm: 1 } }}>
                <IconButton
                  aria-label="Editar club"
                  color="primary"
                  size="small"
                  onClick={() => setEditClub({ clubId: club.id, memberNumber: club.memberNumber || '', clubName: club.name, userClubId: club.userClubId })}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  aria-label="Eliminar club"
                  color="error"
                  size="small"
                  onClick={() => handleRemoveClub(club.id)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
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
    </Box>
  );
};

export default ClubesUsuarioList;