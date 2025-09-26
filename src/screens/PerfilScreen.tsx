import React, { useState, useEffect } from "react";
import { Box, Typography, List, ListItem, ListItemButton, ListItemText, Divider, Paper } from "@mui/material";
import EditUserScreen from "./EditUserScreen";
import ClubesUsuarioList from "./ClubesUsuarioList";

// Función para decodificar el JWT y obtener el payload
function getUserIdFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log(payload);
    return payload.sub || null;
  } catch {
    return null;
  }
}

const PerfilScreen: React.FC = () => {
  const [selectedMenu, setSelectedMenu] = useState<"datos" | "clubes">("datos");
  const [usuarioId, setUsuarioId] = useState<string | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    // Eliminada verificación de expiración de token
    if (token) {
      const id = getUserIdFromToken(token);

      setUsuarioId(id);
    }
  }, [sessionStorage.getItem("token")]);

  return (
    <Box display="flex" height="80vh" minHeight="400px">
      {/* Panel izquierdo */}
      <Paper
        elevation={3}
        sx={{
          width: 240,
          height: '100%',
          p: 2,
          bgcolor: '#f5f5f5',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography variant="h6" mb={2}>Perfil</Typography>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton
              selected={selectedMenu === "datos"}
              onClick={() => setSelectedMenu("datos")}
            >
              <ListItemText primary="Datos Básicos" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              selected={selectedMenu === "clubes"}
              onClick={() => setSelectedMenu("clubes")}
            >
              <ListItemText primary="Clubes" />
            </ListItemButton>
          </ListItem>
        </List>
      </Paper>
      {/* Panel derecho */}
      <Box flex={1} p={4} height="100%" overflow="auto">
        {usuarioId ? (
          selectedMenu === "datos" ? (
            <EditUserScreen userId={usuarioId} onSuccess={() => {}} onCancel={() => {}} source="perfil" />
          ) : (
            <ClubesUsuarioList usuarioId={usuarioId} />
          )
        ) : (
          <Typography color="error">No se pudo obtener el usuario del token.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default PerfilScreen;