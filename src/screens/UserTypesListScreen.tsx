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
  Stack,
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
      const token = localStorage.getItem("token");
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
      const token = localStorage.getItem("token");
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
    <Box p={4}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Tipos de Usuario</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          Crear Tipo
        </Button>
      </Stack>
      {loading && <CircularProgress />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <List>
        {userTypes.map((type) => (
          <ListItem
            key={type.id}
            secondaryAction={
              <>
                <IconButton edge="end" aria-label="edit" onClick={() => handleOpenEdit(type.id)}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => handleOpenConfirm(type.id)}>
                  <DeleteIcon />
                </IconButton>
              </>
            }
          >
            <ListItemText primary={type.name} />
          </ListItem>
        ))}
      </List>
      {/* Modal para crear/editar */}
      <Dialog open={modalOpen} onClose={handleCloseModal}>
        <DialogTitle>
          {modalMode === "create" ? "Crear Tipo de Usuario" : "Editar Tipo de Usuario"}
        </DialogTitle>
        <DialogContent>
          {modalMode === "create" ? (
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
      <Dialog open={confirmOpen} onClose={handleCloseConfirm}>
        <DialogTitle>¿Eliminar tipo de usuario?</DialogTitle>
        <DialogContent>
          <Typography>¿Está seguro que desea eliminar este tipo de usuario?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} disabled={saving}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={saving}>
            {saving ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserTypesListScreen;