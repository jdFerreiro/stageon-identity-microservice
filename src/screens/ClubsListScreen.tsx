import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isTokenExpired } from "../lib/auth";
import api from "../services/api";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
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
  const navigate = useNavigate();

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
    const token = sessionStorage.getItem("token");
    if (isTokenExpired(token)) {
      navigate("/login");
      return;
    }
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

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedClubId(null);
  };

  const handleSuccess = () => {
    handleCloseModal();
    fetchClubs();
  };

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

  return (
    <Box width="100vw" minHeight="100vh" display="flex" justifyContent="center" alignItems="flex-start">
      <Paper sx={{ p: 4, maxWidth: 900, width: '100%', mt: 4, overflowX: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} width="100%">
        <Typography variant="h5" sx={{ flex: 1, textAlign: 'center' }}>Lista de Clubes</Typography>
        <Tooltip title="Crear Club">
          <IconButton color="primary" onClick={handleOpenCreate}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Stack>
      {loading && <CircularProgress />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box width="100%" display="flex" justifyContent="center">
        <List sx={{ width: 800, maxWidth: '100%' }}>
          {clubs.map((club) => (
            <ListItem key={club.id} alignItems="flex-start"
              secondaryAction={
                <>
                  <IconButton edge="end" aria-label="edit" onClick={() => handleOpenEdit(club.id)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete" onClick={() => handleOpenConfirm(club.id)}>
                    <DeleteIcon />
                  </IconButton>
                </>
              }
              sx={{ justifyContent: 'center' }}
            >
              <Box display="flex" alignItems="stretch" width="100%">
                {club.logo ? (
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
                ) : null}
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
          ))}
        </List>
      </Box>
      {/* Modal para crear/editar */}
  <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>
          {modalMode === "create" ? "Crear Club" : "Editar Club"}
        </DialogTitle>
        <DialogContent>
          {modalMode === "create" ? (
            <CreateClubScreen onSuccess={handleSuccess} onCancel={handleCloseModal} clubs={clubs} />
          ) : (
            selectedClubId && (
              <EditClubScreen clubId={selectedClubId} onSuccess={handleSuccess} onCancel={handleCloseModal} />
            )
          )}
        </DialogContent>
      </Dialog>
      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={confirmOpen} onClose={handleCloseConfirm}>
        <DialogTitle>¿Eliminar club?</DialogTitle>
        <DialogContent>
          <Typography>¿Está seguro que desea eliminar este club?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} disabled={saving}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={saving}>
            {saving ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  </Box>
  );
};

export default ClubsListScreen;