import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isTokenExpired } from "../lib/auth";
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

type CreateUserScreenProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

type Role = { id: string; name: string };
type UserType = { id: string; name: string };

const CreateUserScreen: React.FC<CreateUserScreenProps> = ({ onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    roleId: "",
    userTypeId: "",
  });
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [userTypes, setUserTypes] = useState<UserType[]>([]);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (isTokenExpired(token)) {
      navigate("/login");
      return;
    }
    const fetchRoles = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await api.get("/roles", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoles(res.data);
      } catch {
        setRoles([]);
      }
    };
    const fetchUserTypes = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await api.get("/user-types", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserTypes(res.data);
      } catch {
        setUserTypes([]);
      }
    };
    fetchRoles();
    fetchUserTypes();
  }, []);

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
      const token = sessionStorage.getItem("token");
      await api.post(
        "/users",
        {
          email: form.email,
          password: form.password,
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
          "No se pudo crear el usuario. Verifique los datos."
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="h6" mb={2}>
        Crear Usuario
      </Typography>
      <TextField
        label="Email"
        name="email"
        value={form.email}
        onChange={handleChange}
        fullWidth
        required
        margin="normal"
      />
      <TextField
        label="Contraseña"
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        fullWidth
        required
        margin="normal"
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
          {processing ? <CircularProgress size={24} /> : "Crear"}
        </Button>
        <Button variant="outlined" onClick={onCancel} disabled={processing}>
          Cancelar
        </Button>
      </Box>
    </Box>
  );
};

export default CreateUserScreen;