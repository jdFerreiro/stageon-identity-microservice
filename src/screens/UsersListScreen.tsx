import React, { useEffect, useState } from "react";
import { isTokenExpired } from "../lib/auth";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Stack from "@mui/material/Stack";
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CreateUserScreen from './CreateUserScreen';
import EditUserScreen from './EditUserScreen';
import CircularProgress from '@mui/material/CircularProgress';
// Importa el componente de clubes
import ClubesUsuarioList from './ClubesUsuarioList';
import GroupsIcon from '@mui/icons-material/Groups'; // Icono para clubes
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const UsersListScreen: React.FC = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const USERS_ENDPOINT = import.meta.env.VITE_API_USERS || '/users';
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState<string | null>(null);
  const [removeSuccess, setRemoveSuccess] = useState(false);
  const [openClubes, setOpenClubes] = useState(false);
  const [clubesUserId, setClubesUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
  const token = sessionStorage.getItem("token");
    try {
      setProcessing(true);
      const response = await api.get(USERS_ENDPOINT, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err: any) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
  sessionStorage.removeItem("token");
        navigate("/");
      }
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
  const token = sessionStorage.getItem("token");
    if (isTokenExpired(token)) {
  sessionStorage.removeItem("token");
      navigate("/login");
      return;
    }
    fetchUsers();
  }, []);

  const handleEdit = (id: string) => {
    setEditUserId(id);
    setOpenEdit(true);
  };
  const handleBlock = (id: string) => {
    setUserToDelete(id);
    setConfirmDeleteOpen(true);
  };
  const confirmBlockUser = async () => {
    if (!userToDelete) return;
    setProcessing(true);
  const token = sessionStorage.getItem("token");
    await api.patch(`${USERS_ENDPOINT}/${userToDelete}`, { isActive: false }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchUsers();
    setConfirmDeleteOpen(false);
    setUserToDelete(null);
    setProcessing(false);
  };
  const handleUnblock = async (id: string) => {
    setProcessing(true);
  const token = sessionStorage.getItem("token");
    await api.patch(`${USERS_ENDPOINT}/${id}`, { isActive: true }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchUsers();
    setProcessing(false);
  };
  const handleCreate = () => setOpenCreate(true);
  const handleRemove = (id: string) => {
    setUserToRemove(id);
    setConfirmRemoveOpen(true);
  };
  const confirmRemoveUser = async () => {
    if (!userToRemove) return;
    setProcessing(true);
  const token = sessionStorage.getItem("token");
    try {
      await api.delete(`${USERS_ENDPOINT}/${userToRemove}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRemoveSuccess(true);
      await fetchUsers();
    } catch (err) {
      // Puedes mostrar un error aquí si lo deseas
    }
    setConfirmRemoveOpen(false);
    setUserToRemove(null);
    setProcessing(false);
    setTimeout(() => setRemoveSuccess(false), 1500);
  };

  const handleShowClubes = (id: string) => {
    setClubesUserId(id);
    setOpenClubes(true);
  };

  const columns: GridColDef[] = [
    { field: 'email', headerName: 'Email', flex: 2 },
    { field: 'firstName', headerName: 'Nombre', flex: 1.5 },
    { field: 'lastName', headerName: 'Apellido', flex: 1.5 },
    { field: 'role', headerName: 'Rol', flex: 1, renderCell: (params: any) => params.row?.role?.name || '' },
    { field: 'isActive', headerName: 'Estado', flex: 1, renderCell: (params) => params.value ? 'Activo' : 'Bloqueado' },
    {
      field: 'actions',
      headerName: 'Acciones',
      flex: 1.2,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        return (
          <Stack
            direction={isXs ? 'column' : 'row'}
            spacing={0.5}
            alignItems="center"
            justifyContent="center"
            sx={{ width: '100%' }}
          >
            <Tooltip title="Ver clubes">
              <IconButton color="info" onClick={() => handleShowClubes(params.row.id)}>
                <GroupsIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Editar">
              <IconButton color="primary" onClick={() => handleEdit(params.row.id)}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            {params.row.isActive ? (
              <Tooltip title="Bloquear">
                <IconButton color="success" onClick={() => handleBlock(params.row.id)}>
                  <LockOpenIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Desbloquear">
                <IconButton color="error" onClick={() => handleUnblock(params.row.id)}>
                  <LockIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Eliminar">
              <IconButton color="warning" onClick={() => handleRemove(params.row.id)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        );
      },
    },
  ];

  return (
    <Box
      width="100vw"
      height="100vh"
      bgcolor="#f5f5f5"
      p={3}
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{ boxSizing: 'border-box', overflow: 'hidden', position: 'relative' }}
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
      {removeSuccess && (
        <Box sx={{ position: 'fixed', top: 80, right: 40, zIndex: 9999 }}>
          <Alert severity="success">Usuario eliminado correctamente</Alert>
        </Box>
      )}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} width="100%" maxWidth={1200} sx={{ boxSizing: 'border-box' }}>
        <Stack direction="column">
          <Typography variant="h4">Mantenimiento de Usuarios</Typography>
        </Stack>
        <Stack direction="column">
          <Tooltip title="Crear Usuario">
            <IconButton color="primary" onClick={handleCreate}>
              <PersonAddIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Dialog para crear usuario */}
      <Dialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        maxWidth="md"
        fullWidth
        disableEscapeKeyDown
        sx={{
          '& .MuiDialog-paper': {
            width: '50vw',
            height: '80vh',
            margin: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        }}
      >
        <DialogTitle>Crear Usuario</DialogTitle>
        <DialogContent sx={{ width: '90%', height: '100%' }}>
          <CreateUserScreen onSuccess={() => { setOpenCreate(false); fetchUsers(); }} onCancel={() => setOpenCreate(false)} />
        </DialogContent>
      </Dialog>

      {/* Dialog para editar usuario */}
      <Dialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        maxWidth="md"
        fullWidth
        disableEscapeKeyDown
        sx={{
          '& .MuiDialog-paper': {
            width: '50vw',
            height: '80vh',
            margin: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        }}
      >
        <DialogTitle>Editar Usuario</DialogTitle>
        <DialogContent sx={{ width: '90%', height: '100%' }}>
          {editUserId && <EditUserScreen userId={editUserId} onSuccess={() => { setOpenEdit(false); fetchUsers(); }} onCancel={() => setOpenEdit(false)} source="list" />}
        </DialogContent>
      </Dialog>

      <Box width="100%" maxWidth={1200} mx="auto" flex={1} sx={{ boxSizing: 'border-box', overflow: 'auto', height: 'calc(100vh - 120px)' }}>
        <DataGrid
          rows={users}
          columns={columns}
          getRowId={(row) => row.id}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
          pageSizeOptions={[10, 20, 50]}
          sx={{
            width: '100%',
            minHeight: '60vh',
            maxHeight: '100%',
            background: '#fff',
            maxWidth: 1200,
            margin: '0 auto',
            boxSizing: 'border-box',
            overflow: 'auto',
            '& .MuiDataGrid-columnHeader': {
              fontWeight: 'bold',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 'bold',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
            },
          }}
        />
      </Box>

      {/* Dialogo de confirmación para bloquear usuario */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        disableEscapeKeyDown
      >
        <DialogTitle>¿Desea bloquear este usuario?</DialogTitle>
        <DialogContent>El usuario no podrá iniciar sesión hasta que sea desbloqueado.</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)} color="primary">No</Button>
          <Button onClick={confirmBlockUser} color="error">Sí</Button>
        </DialogActions>
      </Dialog>

      {/* Dialogo de confirmación para eliminar usuario */}
      <Dialog
        open={confirmRemoveOpen}
        onClose={() => setConfirmRemoveOpen(false)}
        disableEscapeKeyDown
      >
        <DialogTitle>¿Desea eliminar este usuario?</DialogTitle>
        <DialogContent>Esta acción no se puede deshacer.</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmRemoveOpen(false)} color="primary">No</Button>
          <Button onClick={confirmRemoveUser} color="error">Sí</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para ver clubes del usuario */}
      <Dialog
        open={openClubes}
        onClose={() => setOpenClubes(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Clubes del usuario</DialogTitle>
        <DialogContent>
          {clubesUserId && <ClubesUsuarioList usuarioId={clubesUserId} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenClubes(false)} color="primary">Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersListScreen;