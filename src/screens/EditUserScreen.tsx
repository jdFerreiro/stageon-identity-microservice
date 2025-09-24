import React, { useEffect, useState } from "react";
import api from "../services/api";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";

type EditUserScreenProps = {
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
};

type Role = { id: string; name: string };
type UserType = { id: string; name: string };

const EditUserScreen: React.FC<EditUserScreenProps> = ({ userId, onSuccess, onCancel }) => {
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    roleId: "",
    userTypeId: "",
  });
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [rolesRes, userTypesRes, userRes] = await Promise.all([
          api.get("/roles", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/user-types", { headers: { Authorization: `Bearer ${token}` } }),
          api.get(`/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setRoles(rolesRes.data);
        setUserTypes(userTypesRes.data);
        setForm({
          email: userRes.data.email || "",
          firstName: userRes.data.firstName || "",
          lastName: userRes.data.lastName || "",
          roleId: userRes.data.roleId || "",
          userTypeId: userRes.data.userTypeId || "",
        });
      } catch {
        setError("No se pudo cargar la información del usuario.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      await api.patch(
        `/users/${userId}`,
        {
          firstName: form.firstName,
          lastName: form.lastName,
          roleId: form.roleId,
          userTypeId: form.userTypeId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onSuccess();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "No se pudo actualizar el usuario. Verifique los datos."
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="h6" mb={2}>
        Editar Usuario
      </Typography>
      <TextField
        label="Email"
        name="email"
        value={form.email}
        fullWidth
        margin="normal"
        disabled
      />
      <TextField
        label="Nombre"
        name="firstName"
        value={form.firstName}
        onChange={handleChange}
        fullWidth
        required
        margin="normal"
      />
      <TextField
        label="Apellido"
        name="lastName"
        value={form.lastName}
        onChange={handleChange}
        fullWidth
        required
        margin="normal"
      />
      <FormControl fullWidth margin="normal" required>
        <InputLabel id="role-label">Rol</InputLabel>
        <Select
          labelId="role-label"
          name="roleId"
          value={form.roleId}
          label="Rol"
          onChange={handleChange}
        >
          {roles.map((role) => (
            <MenuItem key={role.id} value={role.id}>
              {role.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal" required>
        <InputLabel id="usertype-label">Tipo de Usuario</InputLabel>
        <Select
          labelId="usertype-label"
          name="userTypeId"
          value={form.userTypeId}
          label="Tipo de Usuario"
          onChange={handleChange}
        >
          {userTypes.map((type) => (
            <MenuItem key={type.id} value={type.id}>
              {type.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      <Box mt={3} display="flex" gap={2}>
        <Button type="submit" variant="contained" color="primary" disabled={processing}>
          {processing ? <CircularProgress size={24} /> : "Guardar"}
        </Button>
        <Button variant="outlined" onClick={onCancel} disabled={processing}>
          Cancelar
        </Button>
      </Box>
    </Box>
  );
};

export default EditUserScreen;