import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Typography, Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";

interface UserType {
  id: string;
  name: string;
}

interface Club {
  id: string;
  name: string;
}

const RegisterUserScreen: React.FC = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    roleId: "",
    userTypeId: "",
    clubs: [] as string[],
  });
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetch("/user-types")
      .then(res => res.json())
      .then((data: UserType[]) => setUserTypes(data))
      .catch(() => setUserTypes([]));
    fetch("/clubs")
      .then(res => res.json())
      .then((data: Club[]) => setClubs(data))
      .catch(() => setClubs([]));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUserTypeChange = (e: SelectChangeEvent) => {
    setForm((prev) => ({
      ...prev,
      userTypeId: e.target.value,
    }));
  };

  const handleClubsChange = (e: SelectChangeEvent<string[]>) => {
    const value = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
    setForm((prev) => ({
      ...prev,
      clubs: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.status === 201) {
        setSuccess("Usuario registrado correctamente.");
        setForm({
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          roleId: "",
          userTypeId: "",
          clubs: [],
        });
      } else {
        const data = await res.json();
        setError(data.message || "No se pudo registrar el usuario.");
      }
    } catch {
      setError("Error de red o servidor.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={5}>
      <Typography variant="h5" mb={2}>Registro de Usuario</Typography>
      <form onSubmit={handleSubmit}>
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
        <TextField
          label="ID de Rol"
          name="roleId"
          value={form.roleId}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        <FormControl fullWidth margin="normal" required>
          <InputLabel id="usertype-label">Tipo de Usuario</InputLabel>
          <Select
            labelId="usertype-label"
            name="userTypeId"
            value={form.userTypeId}
            label="Tipo de Usuario"
            onChange={handleUserTypeChange}
          >
            {userTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal" required>
          <InputLabel id="clubs-label">Clubes</InputLabel>
          <Select
            labelId="clubs-label"
            multiple
            name="clubs"
            value={form.clubs}
            label="Clubes"
            onChange={handleClubsChange}
            renderValue={(selected) =>
              clubs
                .filter(club => selected.includes(club.id))
                .map(club => club.name)
                .join(', ')
            }
          >
            {clubs.map((club) => (
              <MenuItem key={club.id} value={club.id}>
                {club.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        <Box mt={2}>
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={processing}>
            {processing ? <CircularProgress size={24} /> : "Registrar"}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default RegisterUserScreen;