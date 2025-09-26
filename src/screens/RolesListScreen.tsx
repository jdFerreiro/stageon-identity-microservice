  const ROLES_ENDPOINT = import.meta.env.VITE_API_ROLES || '/roles';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isTokenExpired } from '../lib/auth';
import api from '../services/api';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import CreateRoleScreen from './CreateRoleScreen';
import EditRoleScreen from './EditRoleScreen';

const RolesListScreen: React.FC = () => {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
    const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editRoleId, setEditRoleId] = useState<string | null>(null);
  const handleAdd = () => {
    setOpenCreateDialog(true);
  };

  const handleEdit = (role: any) => {
    setEditRoleId(role.id);
    setOpenEditDialog(true);
  };

  const handleDelete = (id: string) => {
    setDeleteRoleId(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
    setDeleteRoleId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteRoleId) return;
    setProcessing(true);
    try {
      const token = sessionStorage.getItem('token');
      await api.delete(`${ROLES_ENDPOINT}/${deleteRoleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Actualizar lista de roles
      const response = await api.get(ROLES_ENDPOINT, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoles(response.data);
    } catch (err) {
      // Puedes agregar manejo de error aquí si lo deseas
    } finally {
      setProcessing(false);
      setOpenDeleteDialog(false);
      setDeleteRoleId(null);
    }
  };

  useEffect(() => {
    // Token expiration check
    const token = sessionStorage.getItem('token');
    if (isTokenExpired(token)) {
      sessionStorage.removeItem('token');
      navigate('/login');
      return;
    }
    const fetchRoles = async () => {
      const token = sessionStorage.getItem('token');
      const response = await api.get(ROLES_ENDPOINT, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoles(response.data);
    };
    fetchRoles();
  }, []);

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Nombre',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'isActive',
      headerName: 'Estado',
      width: 120,
      renderCell: (params) => params.value ? 'Activo' : 'Inactivo',
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 180,
      sortable: false,
      filterable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" width="100%">
          <Tooltip title="Editar">
            <IconButton size="small" color="primary" onClick={() => handleEdit(params.row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton size="small" color="error" onClick={() => handleDelete(params.row.id)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];










  return (
    <Box width="100vw" height="100vh" bgcolor="#f5f5f5" p={3} display="flex" flexDirection="column" alignItems="center" sx={{ boxSizing: 'border-box', overflow: 'hidden', position: 'relative' }}>
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
      <Box width="100%" maxWidth={1000} mx="auto" mb={3} display="flex" justifyContent="space-between" alignItems="center" sx={{ boxSizing: 'border-box' }}>
        <Typography variant="h4">Mantenimiento de Roles</Typography>
        <Tooltip title="Agregar">
          <IconButton color="primary" onClick={handleAdd} size="large">
            <AddIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      </Box>
      <Box width="100%" maxWidth={1000} mx="auto" flex={1} sx={{ boxSizing: 'border-box', overflowX: 'auto', height: 'calc(100vh - 120px)' }}>
        <DataGrid
          rows={roles}
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
            minWidth: 400,
            minHeight: '60vh',
            maxHeight: '100%',
            background: '#fff',
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
      {/* Dialog para crear rol */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth={false}
        fullWidth
        disableEscapeKeyDown
        sx={{
          '& .MuiDialog-paper': {
            width: '100%',
            maxWidth: '1000px',
            height: '80vh',
            margin: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        }}
      >
        <DialogTitle sx={{ width: '100%' }}>Crear Rol</DialogTitle>
        <DialogContent sx={{ width: '100%', height: '100%' }}>
          <CreateRoleScreen />
        </DialogContent>
      </Dialog>

      {/* Dialog para editar rol */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth={false}
        fullWidth
        disableEscapeKeyDown
        sx={{
          '& .MuiDialog-paper': {
            width: '100%',
            maxWidth: '1000px',
            height: '80vh',
            margin: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        }}
      >
        <DialogTitle sx={{ width: '100%' }}>Editar Rol</DialogTitle>
        <DialogContent sx={{ width: '100%', height: '100%' }}>
          {editRoleId && <EditRoleScreen id={editRoleId} />}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteDialogClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', mb: 1 }}>¿Eliminar rol?</DialogTitle>
        <DialogContent>
          <Typography>¿Está seguro que desea eliminar este rol?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} variant="outlined" color="secondary" disabled={processing}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" disabled={processing}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RolesListScreen;