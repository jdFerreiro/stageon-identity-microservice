import React, { useEffect, useState } from "react";
import api from "../services/api";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CreateUserTypeScreen from "./CreateUserTypeScreen";
import EditUserTypeScreen from "./EditUserTypeScreen";

type UserType = {
  id: string;
  name: string;
};

const UserTypesListScreen: React.FC = () => {
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedUserTypeId, setSelectedUserTypeId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchUserTypes = async () => {
    setLoading(true);
    setError("");
    try {
      const token = sessionStorage.getItem("token");
      const res = await api.get("/user-types", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserTypes(res.data);
    } catch {
      setError("No se pudieron cargar los tipos de usuario.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserTypes();
  }, []);

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedUserTypeId(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (id: string) => {
    setModalMode("edit");
    setSelectedUserTypeId(id);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUserTypeId(null);
  };

  const handleSuccess = () => {
    handleCloseModal();
    fetchUserTypes();
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
      await api.delete(`/user-types/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      handleCloseConfirm();
      fetchUserTypes();
    } catch {
      setError("No se pudo eliminar el tipo de usuario.");
    } finally {
      setSaving(false);
    }
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
        <Typography variant="h4">Tipos de Usuario</Typography>
        <Tooltip title="Agregar">
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
          {userTypes.map((type) => (
            <ListItem
              key={type.id}
              secondaryAction={
                <Box display="flex" gap={1}>
                  <Tooltip title="Editar">
                    <IconButton edge="end" color="primary" aria-label="edit" onClick={() => handleOpenEdit(type.id)} size="small">
                      <EditIcon fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton edge="end" color="error" aria-label="delete" onClick={() => handleOpenConfirm(type.id)} size="small">
                      <DeleteIcon fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
              sx={{ justifyContent: 'center', alignItems: 'stretch' }}
            >
              <ListItemText primary={type.name} />
            </ListItem>
          ))}
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
        <DialogTitle>{modalMode === 'create' ? 'Crear Tipo de Usuario' : 'Editar Tipo de Usuario'}</DialogTitle>
        <DialogContent sx={{ width: '100%', height: '100%' }}>
          {modalMode === 'create' ? (
            <CreateUserTypeScreen onSuccess={handleSuccess} onCancel={handleCloseModal} />
          ) : (
            selectedUserTypeId && (
              <EditUserTypeScreen
                userTypeId={selectedUserTypeId}
                onSuccess={handleSuccess}
                onCancel={handleCloseModal}
              />
            )
          )}
        </DialogContent>
      </Dialog>
      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={confirmOpen} onClose={handleCloseConfirm} maxWidth="xs" fullWidth>
        <DialogTitle>¿Eliminar tipo de usuario?</DialogTitle>
        <DialogContent>
          <Typography>¿Está seguro que desea eliminar este tipo de usuario?</Typography>
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

export default UserTypesListScreen;