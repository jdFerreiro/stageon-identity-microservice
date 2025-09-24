# Identity Microservice React Library

Componentes exportados:
- UsersListScreen
- RolesListScreen
- CreateUserScreen
- EditUserScreen
- CreateRoleScreen
- EditRoleScreen
- LoginScreen

## Uso

```tsx
import { UsersListScreen, RolesListScreen } from 'identity-microservice/lib';
import { LoginScreen } from 'identity-microservice/lib';

// En tu app:
<UsersListScreen />
<RolesListScreen />
```

## Variables de entorno
Define en el proyecto destino:
- VITE_API_URL
- VITE_API_ROLES
- VITE_API_USERS
