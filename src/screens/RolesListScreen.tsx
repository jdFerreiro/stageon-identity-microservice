
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import CreateRoleScreen from './CreateRoleScreen';
import EditRoleScreen from './EditRoleScreen';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const ROLES_ENDPOINT = import.meta.env.VITE_API_ROLES || '/roles';

const RolesListScreen: React.FC = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const [processing, setProcessing] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editRoleId, setEditRoleId] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);

  const fetchRoles = async () => {
    setProcessing(true);
    const token = sessionStorage.getItem('token');
    try {
      const response = await api.get(ROLES_ENDPOINT, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoles(response.data);
    } catch (err) {
      // Handle error
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleAdd = () => {
    setOpenCreateDialog(true);
  };

  const handleEdit = (id: string) => {
    setEditRoleId(id);
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
    const token = sessionStorage.getItem('token');
    try {
      await api.delete(`${ROLES_ENDPOINT}/${deleteRoleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchRoles();
      setOpenDeleteDialog(false);
      setDeleteRoleId(null);
    } catch (err) {
      // Handle error
    } finally {
      setProcessing(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Nombre', flex: 1, minWidth: 150 },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <Tooltip title="Editar">
            <IconButton color="primary" onClick={() => handleEdit(params.row.id)} size="small">
              <EditIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton color="error" onClick={() => handleDelete(params.row.id)} size="small">
              <DeleteIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box
      width="100%"
      minHeight="100%"
      bgcolor="#f5f5f5"
      p={{ xs: 1, sm: 2, md: 3 }}
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{ boxSizing: 'border-box', position: 'relative', overflow: 'visible' }}
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
      <Box width="100%" maxWidth={1000} mx="auto" mb={3} display="flex" justifyContent="space-between" alignItems="center" sx={{ boxSizing: 'border-box' }}>
        <Typography variant="h4">Mantenimiento de Roles</Typography>
        <Tooltip title="Agregar">
          <IconButton color="primary" onClick={handleAdd} size="large">
            <AddIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      </Box>
      <Box width="100%" maxWidth={1000} mx="auto" flex={1} sx={{
        boxSizing: 'border-box',
        overflow: 'visible',
        height: { xs: 'auto', md: 'auto' },
        minHeight: 300,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
      }}>
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
          autoHeight
          sx={{
            width: '100%',
            minWidth: 320,
            background: '#fff',
            maxWidth: 1000,
            margin: '0 auto',
            boxSizing: 'border-box',
            overflow: 'visible',
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
        maxWidth={isXs ? false : 'md'}
        fullWidth
        disableEscapeKeyDown
        sx={{
          '& .MuiDialog-paper': {
            width: isXs ? '100vw' : '90vw',
            maxWidth: isXs ? '100vw' : 600,
            height: isXs ? '100vh' : '90vh',
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
        maxWidth={isXs ? false : 'md'}
        fullWidth
        disableEscapeKeyDown
        sx={{
          '& .MuiDialog-paper': {
            width: isXs ? '100vw' : '90vw',
            maxWidth: isXs ? '100vw' : 600,
            height: isXs ? '100vh' : '90vh',
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