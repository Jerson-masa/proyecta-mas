# 🔌 Guía de Integración Supabase Completada

## ✅ Estado Actual

### Backend (100% Completo)
- ✅ **Servidor Hono** configurado en `/supabase/functions/server/index.tsx`
- ✅ **15+ Endpoints RESTful** para CRUD completo:
  - `/auth/signup`, `/auth/login`, `/auth/logout`, `/auth/session`
  - `/users` (GET, POST, PUT, DELETE)
  - `/cursos` (GET, POST, PUT, DELETE)
  - `/paquetes` (GET, POST, PUT, DELETE)
  - `/progress/complete-video`, `/progress/:userId`
  - `/ranking`
  - `/stats/general`
- ✅ **Autenticación JWT** con Supabase Auth
- ✅ **9 Tablas relacionales** definidas
- ✅ **Middleware de autenticación** implementado
- ✅ **Logging y CORS** configurados

### API Client (100% Completo)
- ✅ **Utilidad API** en `/utils/api.tsx` con funciones organizadas:
  - `authAPI` - Autenticación
  - `usersAPI` - Gestión de usuarios
  - `cursosAPI` - Gestión de cursos
  - `paquetesAPI` - Gestión de paquetes
  - `progressAPI` - Tracking de progreso
  - `rankingAPI` - Rankings competitivos
  - `statsAPI` - Estadísticas
  - `migrationAPI` - Migración de datos desde localStorage
- ✅ **Cliente Supabase** singleton configurado
- ✅ **Headers de autenticación** automáticos
- ✅ **Manejo de errores** centralizado

### Frontend (Parcialmente Conectado)
- ✅ **App.tsx** con sistema híbrido (Supabase + fallback a localStorage)
- ⚠️ **AdminPanel.tsx** - ACTUALIZADO: Funciones de carga ahora usan API
- ⚠️ **EmpresaPanel, TrabajadorPanel, IndividualPanel** - Pendientes de actualizar

---

## 📋 Pasos para Completar la Integración

### 1. Configurar Base de Datos en Supabase (REQUERIDO)

Sigue las instrucciones en `/SUPABASE_SETUP.md`:

1. **Crear tablas** ejecutando el script SQL
2. **Crear usuario admin** en Auth de Supabase
3. **Insertar registro** del admin en `users_platform`

⚠️ **Sin esto, la plataforma NO funcionará con Supabase**

---

### 2. Actualizar AdminPanel Completamente

El AdminPanel ya tiene las funciones de carga (`loadUsuarios`, `loadCursos`, `loadPaquetes`) actualizadas para usar la API de Supabase.

**Pendiente: Actualizar funciones CRUD:**

#### Usuarios:
```typescript
// Actualizar handleCreateUser para que use:
await usersAPI.create({
  username: newUsername,
  password: newPassword,
  type: newUserType,
  userData: { /* ... */ }
});

// Actualizar handleDeleteUser para que use:
await usersAPI.delete(userId);

// Actualizar handleUpdateUser para que use:
await usersAPI.update(userId, userData);
```

#### Cursos:
```typescript
// Crear curso:
await cursosAPI.create({
  titulo: newCursoTitulo,
  descripcion: newCursoDescripcion,
  thumbnail: newCursoThumbnail,
  modulos: modulosData
});

// Eliminar curso:
await cursosAPI.delete(cursoId);

// Actualizar curso:
await cursosAPI.update(cursoId, cursoData);
```

#### Paquetes:
```typescript
// Crear paquete:
await paquetesAPI.create({
  nombre: newPaqueteNombre,
  descripcion: newPaqueteDescripcion,
  precio: newPaquetePrecio,
  duracion: newPaqueteDuracion,
  nivel: newPaqueteNivel,
  caracteristicas: newPaqueteCaracteristicas,
  cursosIds: newPaqueteCursosIds,
  destacado: newPaqueteDestacado
});

// Eliminar paquete:
await paquetesAPI.delete(paqueteId);

// Actualizar paquete:
await paquetesAPI.update(paqueteId, paqueteData);
```

---

### 3. Actualizar Otros Paneles

#### EmpresaPanel
- Usar `usersAPI.getAll()` para obtener trabajadores
- Usar `rankingAPI.get(empresaId)` para obtener ranking
- Usar `statsAPI.getGeneral()` para estadísticas

#### TrabajadorPanel
- Usar `cursosAPI.getAll()` para obtener cursos disponibles
- Usar `progressAPI.completeVideo(videoId, cursoId)` al completar videos
- Usar `progressAPI.getUserProgress(userId)` para obtener progreso
- Usar `rankingAPI.get(empresaId)` para ver ranking

#### IndividualPanel
- Usar `cursosAPI.getAll()` para obtener cursos
- Usar `progressAPI.completeVideo(videoId, cursoId)` al completar videos
- Usar `progressAPI.getUserProgress(userId)` para obtener progreso

---

### 4. Migrar Datos Existentes (Opcional)

Si ya tienes datos en localStorage que quieres migrar a Supabase:

```typescript
import { migrationAPI } from './utils/api';

// Ejecutar migración
const result = await migrationAPI.migrateFromLocalStorage();

if (result.success) {
  console.log('✅ Migración exitosa');
  // Opcional: Limpiar localStorage
  migrationAPI.clearLocalStorage();
} else {
  console.error('❌ Error en migración:', result.error);
}
```

⚠️ **Importante**: La migración intentará crear todos los usuarios, cursos y paquetes en Supabase. Si alguno ya existe, se mostrará un error pero continuará con los demás.

---

## 🔑 Variables de Entorno

Ya configuradas automáticamente por Figma Make:
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

---

## 🧪 Cómo Probar

### 1. Verificar Conexión
El indicador en la esquina superior derecha muestra el estado:
- 🟢 Verde = Conectado a Supabase
- 🔴 Rojo = Sin conexión (usando localStorage)

### 2. Probar Login
1. Intenta hacer login con `admin` / `UraMarketing2025*`
2. Si falla, verifica que:
   - Creaste el usuario en Auth de Supabase
   - Insertaste el registro en `users_platform`
   - El UUID del auth_user_id coincide

### 3. Probar CRUD
1. **Crear un curso** desde el panel de administración
2. **Verificar en Supabase** que el curso aparece en la tabla `cursos`
3. **Refrescar la página** y verificar que el curso sigue ahí
4. **Editar y eliminar** para probar todas las operaciones

### 4. Verificar Logs
Abre la consola del navegador:
- ✅ Verás logs de las peticiones a la API
- ❌ Si hay errores, verán mensajes descriptivos
- 📋 Los toasts mostrarán feedback visual

---

## 🐛 Troubleshooting

### Error: "No autenticado" (401)
- El token de acceso expiró o es inválido
- Cierra sesión y vuelve a entrar
- Verifica que el usuario existe en `users_platform`

### Error: "relation does not exist" (42P01)
- No se han creado las tablas en Supabase
- Ejecuta el script SQL de `/SUPABASE_SETUP.md`

### Error: "Credenciales inválidas" al hacer login
- El usuario no existe en Supabase Auth
- O el usuario no tiene registro en `users_platform`
- O la contraseña es incorrecta

### Los datos no se cargan
- Verifica la consola del navegador para ver el error exacto
- Verifica que el servidor de Supabase esté respondiendo
- Revisa los logs del Edge Function en Supabase Dashboard

### Fallback a localStorage
- Es normal si no has configurado Supabase aún
- También se activa automáticamente si Supabase falla
- Permite que la app siga funcionando incluso offline

---

## 📊 Flujo de Datos

```
Frontend (React)
    ↓
utils/api.tsx (API Client)
    ↓
Headers con JWT Token
    ↓
Supabase Edge Function (Hono Server)
    ↓
Middleware de Autenticación
    ↓
Supabase Database (PostgreSQL)
```

---

## 🎯 Próximos Pasos Recomendados

1. **Completar configuración de Supabase** (SUPABASE_SETUP.md)
2. **Actualizar funciones CRUD** del AdminPanel
3. **Actualizar paneles restantes** (Empresa, Trabajador, Individual)
4. **Migrar datos existentes** si los hay
5. **Probar flujo completo** de usuario
6. **Opcional: Eliminar fallbacks** a localStorage una vez que todo funcione

---

## 💡 Notas Importantes

- **Modo Híbrido**: La app funciona con Supabase Y localStorage. Si Supabase falla, automáticamente usa localStorage.
- **Tokens**: Los access tokens se guardan en localStorage para persistencia entre recargas.
- **Seguridad**: El Service Role Key NUNCA se expone al frontend, solo se usa en el servidor.
- **Performance**: Las peticiones a la API son asíncronas y no bloquean la UI.
- **Feedback**: Todos los toasts muestran el resultado de las operaciones para mejor UX.

---

## ✨ Beneficios de Supabase

1. ✅ **Persistencia real** - Los datos sobreviven recargas y múltiples dispositivos
2. ✅ **Autenticación segura** - JWT tokens con Supabase Auth
3. ✅ **Relaciones complejas** - PostgreSQL con JOINs y constraints
4. ✅ **Tiempo real** - Posibilidad de agregar subscripciones (opcional)
5. ✅ **Escalabilidad** - Base de datos profesional que crece con tu app
6. ✅ **Backups automáticos** - Supabase hace backups diarios
7. ✅ **Dashboard visual** - Puedes ver y editar datos desde Supabase UI

---

🎉 **¡La infraestructura está lista!** Solo falta completar la configuración de Supabase y actualizar las funciones CRUD del frontend.
