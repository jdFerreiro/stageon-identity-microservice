import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Button,
  Box,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CreateClubScreen from "./CreateClubScreen";
import EditClubScreen from "./EditClubScreen";

type Club = {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
};

const ClubsListScreen: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleOpenConfirm = (id: string) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setDeleteId(null);
    setConfirmOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      const token = sessionStorage.getItem("token");
      await api.delete(`/clubs/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      handleCloseConfirm();
      fetchClubs();
    } catch {
      setError("No se pudo eliminar el club.");
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedClubId(null);
  };

  const handleSuccess = () => {
    handleCloseModal();
    fetchClubs();
  };

  const fetchClubs = async () => {
    setLoading(true);
    setError("");
    try {
      const token = sessionStorage.getItem("token");
      const res = await api.get("/clubs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClubs(res.data);
    } catch {
      setError("No se pudieron cargar los clubes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedClubId(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (clubId: string) => {
    setModalMode("edit");
    setSelectedClubId(clubId);
    setModalOpen(true);
  };

  return (
    <Box
      width="100%"
      minHeight="100vh"
      bgcolor="#f5f5f5"
      p={{ xs: 1, sm: 2, md: 3 }}
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{ boxSizing: 'border-box', position: 'relative', overflow: 'visible' }}
    >
      <Box width="100%" maxWidth={1000} mx="auto" mb={3} display="flex" justifyContent="space-between" alignItems="center" sx={{ boxSizing: 'border-box' }}>
        <Typography variant="h4">Lista de Clubes</Typography>
        <Tooltip title="Crear Club">
          <IconButton color="primary" onClick={handleOpenCreate} size="large">
            <AddIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      </Box>
      {loading && <CircularProgress />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box width="100%" maxWidth={1000} mx="auto" flex={1} sx={{
        boxSizing: 'border-box',
        overflow: 'visible',
        minHeight: 300,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
      }}>
        <List sx={{ width: '100%', maxWidth: 1000 }}>
          {clubs.map((club) => {
            return (
              <ListItem
                key={club.id}
                alignItems="flex-start"
                secondaryAction={
                  <Box display="flex" gap={1}>
                    <Tooltip title="Editar">
                      <IconButton edge="end" color="primary" aria-label="edit" onClick={() => handleOpenEdit(club.id)} size="small">
                        <EditIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton edge="end" color="error" aria-label="delete" onClick={() => handleOpenConfirm(club.id)} size="small">
                        <DeleteIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
                sx={{ justifyContent: 'center', alignItems: 'stretch' }}
              >
                <Box display="flex" alignItems="stretch" width="100%">
                  {club.logo && (
                    <Box mr={2} minWidth={90} display="flex" alignItems="stretch">
                      <img
                        src={club.logo}
                        alt={club.name + ' logo'}
                        style={{
                          width: 90,
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: 8,
                          border: '1px solid #ccc',
                          background: '#fff',
                          display: 'block',
                          alignSelf: 'stretch',
                          minHeight: 80
                        }}
                      />
                    </Box>
                  )}
                  <ListItemText
                    primary={<span style={{ width: '30%', display: 'inline-block' }}>{club.name}</span>}
                    secondary={
                      <span style={{ width: '60%', display: 'inline-block' }}>
                        {club.description && <span>{club.description}<br /></span>}
                        {club.address && <span>Dirección: {club.address}<br /></span>}
                        {club.phone && <span>Teléfono: {club.phone}<br /></span>}
                        {club.email && <span>Email: {club.email}</span>}
                      </span>
                    }
                  />
                </Box>
              </ListItem>
            );
          })}
        </List>
      </Box>
      {/* Modal para crear/editar */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth={false}
        fullWidth
        disableEscapeKeyDown
        sx={{
          '& .MuiDialog-paper': {
            width: { xs: '100vw', sm: '90vw' },
            maxWidth: 600,
            height: { xs: '100vh', sm: '90vh' },
            margin: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        }}
      >
        <DialogTitle>{modalMode === 'create' ? 'Crear Club' : 'Editar Club'}</DialogTitle>
        <DialogContent sx={{ width: '100%', height: '100%' }}>
          {modalMode === 'create' ? (
            <CreateClubScreen onSuccess={handleSuccess} onCancel={handleCloseModal} clubs={clubs} />
          ) : (
            selectedClubId && (
              <EditClubScreen clubId={selectedClubId} onSuccess={handleSuccess} onCancel={handleCloseModal} />
            )
          )}
        </DialogContent>
      </Dialog>
      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={confirmOpen} onClose={handleCloseConfirm} maxWidth="xs" fullWidth>
        <DialogTitle>¿Eliminar club?</DialogTitle>
        <DialogContent>
          <Typography>¿Está seguro que desea eliminar este club?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} disabled={saving}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={saving}>
            {saving ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClubsListScreen;