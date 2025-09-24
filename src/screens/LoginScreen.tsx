import React, { useState } from "react";
import api from "../services/api";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";

type LoginScreenProps = {
  onLoginSuccess?: (userData: any) => void;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.data && response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        // Notifica al padre si existe el callback
        if (onLoginSuccess) {
          onLoginSuccess(response.data);
        } else {
          window.location.href = "/users";
        }
      } else {
        setError("Respuesta inesperada del servidor");
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Error de conexión o credenciales inválidas");
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      {processing && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            bgcolor: "rgba(255,255,255,0.7)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "auto",
          }}
        >
          <CircularProgress size={70} color="primary" thickness={5} />
        </Box>
      )}
      <Box
        width={350}
        p={4}
        boxShadow={3}
        borderRadius={2}
        bgcolor="#fff"
        mx="auto"
        mt={8}
      >
        <Typography variant="h5" mb={2} align="center">
          Login
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <Box display="flex" justifyContent="flex-end" width="100%">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="medium"
              sx={{ mt: 2, minWidth: 120 }}
              startIcon={<LoginIcon />}
            >
              Ingresar
            </Button>
          </Box>
        </form>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
    </>
  );
};
export default LoginScreen;