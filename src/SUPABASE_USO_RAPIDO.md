# 🚀 Uso Rápido: Nueva Arquitectura Supabase

## ✅ **¿QUÉ CAMBIÓ?**

Tu plataforma ahora tiene **doble modo**:

### **Modo Supabase (☁️ Nube)** - NUEVO
- ✅ Autenticación real con JWT
- ✅ Datos persistentes en PostgreSQL
- ✅ Multi-dispositivo
- ✅ Backups automáticos

### **Modo localStorage (💾 Local)** - LEGACY
- Compatible con datos antiguos
- Fallback automático si Supabase falla
- Se puede desactivar después de migrar

---

## 🎯 **CÓMO FUNCIONA AHORA**

### 1️⃣ **Login Mejorado**

Cuando un usuario hace login:

```javascript
// App.tsx ahora intenta PRIMERO Supabase
const handleLogin = async (username, password) => {
  try {
    // 1. Intentar login con Supabase
    const result = await authAPI.login(username, password);
    
    if (result.success) {
      // ✅ Login exitoso en Supabase
      setUser(result.user);
      return true;
    }
  } catch (error) {
    // ⚠️ Falló Supabase, intentar localStorage
    return handleLocalStorageLogin(username, password);
  }
}
```

**Flujo:**
1. Usuario ingresa credenciales
2. Se intenta login en Supabase
3. Si falla, se intenta con localStorage
4. Se guarda sesión en ambos lados (redundancia)

---

### 2️⃣ **Panel de Migración Visual**

Ahora verás un botón flotante **"Migración a Supabase"** cuando inicies sesión como admin:

![Panel de Migración](https://via.placeholder.com/600x400/4F46E5/FFFFFF?text=Panel+de+Migracion)

**Características:**
- 📊 Muestra cuántos datos tienes (usuarios, cursos, paquetes)
- 📥 Descarga backup automático antes de migrar
- 🔄 Migración paso a paso con progreso visual
- ✅ Verificación automática post-migración
- 🗑️ Opción para limpiar localStorage después

**Cómo usarlo:**

1. **Haz login como admin**
2. **Verás el botón flotante** en la esquina inferior derecha
3. **Haz clic** para abrir el panel
4. **Revisa los datos** que se van a migrar
5. **Haz clic en "Descargar Backup"** (por seguridad)
6. **Haz clic en "Iniciar Migración"**
7. **Observa el progreso** en tiempo real:
   - ⏳ Gris = Pendiente
   - 🔵 Azul pulsante = Procesando
   - ✅ Verde = Completado
   - ❌ Rojo = Error

---

### 3️⃣ **Toggle de Desarrollo**

En modo desarrollo, verás un toggle en la esquina inferior izquierda:

```
[✓] Usar Supabase
☁️ Nube
```

**Úsalo para:**
- ✅ Probar con Supabase activado
- ✅ Volver a localStorage si algo falla
- ✅ Comparar comportamiento

**NOTA:** Este toggle NO aparece en producción.

---

## 🔑 **CREDENCIALES**

### Admin (Siempre funciona)
```
Usuario: admin
Password: UraMarketing2025*
```

### Usuarios Migrados
Después de migrar, usa las mismas credenciales que tenías en localStorage.

---

## 📱 **EXPERIENCIA DE USUARIO**

### Antes (localStorage)
```
1. Login → Verificar localStorage
2. Si existe → Entrar
3. Cerrar navegador → Datos se mantienen
4. Limpiar navegador → ❌ TODO SE PIERDE
```

### Ahora (Supabase)
```
1. Login → Verificar Supabase → Crear sesión JWT
2. Si existe → Entrar
3. Cerrar navegador → Sesión activa (por días)
4. Limpiar navegador → ✅ DATOS SEGUROS EN LA NUBE
5. Abrir en otro dispositivo → ✅ ACCESO AUTOMÁTICO
```

---

## 🛠️ **EJEMPLOS DE USO EN CÓDIGO**

### Crear Usuario (Admin)

**Antes (localStorage):**
```javascript
const newUser = { username, password, type };
const users = JSON.parse(localStorage.getItem('users') || '[]');
users.push(newUser);
localStorage.setItem('users', JSON.stringify(users));
```

**Ahora (Supabase):**
```javascript
import { authAPI } from './utils/api';

const newUser = await authAPI.signup({
  username: 'empresa1',
  password: 'password123',
  type: 'empresa',
  userData: {
    nombreCompleto: 'Empresa Ejemplo S.A.',
    email: 'contacto@empresa.com',
  }
});

// ✅ Usuario creado en DB
// ✅ Contraseña hasheada automáticamente
// ✅ Código único generado (EMP-1)
```

---

### Listar Cursos

**Antes (localStorage):**
```javascript
const cursos = JSON.parse(localStorage.getItem('cursos') || '[]');
```

**Ahora (Supabase):**
```javascript
import { cursosAPI } from './utils/api';

const { cursos } = await cursosAPI.getAll();

// ✅ Incluye módulos y videos automáticamente
// ✅ Ordenados por fecha de creación
// ✅ Con relaciones SQL optimizadas
```

---

### Marcar Video Completado

**Antes (localStorage):**
```javascript
const progress = JSON.parse(localStorage.getItem('progress') || '{}');
progress[videoId] = true;
localStorage.setItem('progress', JSON.stringify(progress));
```

**Ahora (Supabase):**
```javascript
import { progressAPI } from './utils/api';

await progressAPI.completeVideo(videoId, cursoId);

// ✅ Video marcado como completado
// ✅ Progreso del curso actualizado automáticamente
// ✅ Ranking actualizado con puntos
// ✅ Timestamp registrado
```

---

### Obtener Ranking

**Antes (localStorage):**
```javascript
const ranking = JSON.parse(localStorage.getItem('ranking') || '[]');
ranking.sort((a, b) => b.puntos - a.puntos);
```

**Ahora (Supabase):**
```javascript
import { rankingAPI } from './utils/api';

// Ranking general
const { ranking } = await rankingAPI.get();

// Ranking por empresa
const { ranking } = await rankingAPI.get('empresa-id-123');

// Ranking de mes específico
const { ranking } = await rankingAPI.get(null, 11, 2024);

// ✅ Pre-ordenado por puntos y tiempo
// ✅ Incluye datos del usuario automáticamente
// ✅ Filtrado optimizado con índices SQL
```

---

## 🔄 **PROCESO DE MIGRACIÓN DETALLADO**

### Paso 1: Preparación (5 min)

```bash
# 1. Verifica que Supabase esté conectado
curl https://TU_PROJECT.supabase.co/functions/v1/make-server-1fcaa2e7/health

# Debe responder: {"status":"ok","timestamp":"..."}
```

### Paso 2: Crear Tablas (10 min)

1. Ve a https://supabase.com/dashboard
2. Abre **SQL Editor**
3. Ejecuta scripts de `/SUPABASE_SETUP.md` uno por uno
4. Verifica:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

### Paso 3: Crear Admin (2 min)

```sql
-- 1. Ir a Authentication > Users
-- 2. Crear usuario: admin@plataforma.local
-- 3. Copiar UUID del usuario
-- 4. Ejecutar:

INSERT INTO users_platform (
  auth_user_id,
  username,
  codigo,
  type,
  nombre_completo
) VALUES (
  'UUID_COPIADO_AQUI',
  'admin',
  'ADMIN-1',
  'admin',
  'Administrador'
);
```

### Paso 4: Migrar (15 min)

1. **Login como admin** en tu plataforma
2. **Haz clic** en botón "Migración a Supabase"
3. **Descarga backup** (por seguridad)
4. **Inicia migración**
5. **Espera** a que termine (barras de progreso)
6. **Verifica** que todo se migró correctamente

### Paso 5: Verificar (5 min)

```javascript
// Abrir consola del navegador (F12)

// 1. Verificar usuarios
const { usersAPI } = await import('./utils/api.tsx');
const { users } = await usersAPI.getAll();
console.log('Usuarios migrados:', users.length);

// 2. Verificar cursos
const { cursosAPI } = await import('./utils/api.tsx');
const { cursos } = await cursosAPI.getAll();
console.log('Cursos migrados:', cursos.length);

// 3. Verificar paquetes
const { paquetesAPI } = await import('./utils/api.tsx');
const { paquetes } = await paquetesAPI.getAll();
console.log('Paquetes migrados:', paquetes.length);
```

### Paso 6: Limpiar (Después de verificar)

1. **Usa la plataforma** por 1-2 días
2. **Confirma** que todo funciona
3. **Abre panel de migración**
4. **Haz clic** en "Limpiar localStorage"

---

## 🐛 **TROUBLESHOOTING**

### Problema: "No se puede conectar a Supabase"

**Solución:**
```javascript
// 1. Verificar credenciales
console.log('Project ID:', import.meta.env.VITE_SUPABASE_URL);
console.log('Anon Key:', import.meta.env.VITE_SUPABASE_ANON_KEY);

// 2. Verificar health endpoint
fetch('https://TU_PROJECT.supabase.co/functions/v1/make-server-1fcaa2e7/health')
  .then(r => r.json())
  .then(d => console.log('Server OK:', d));

// 3. Si falla, activar fallback localStorage
// (usar el toggle en esquina inferior izquierda)
```

### Problema: "Usuario ya existe"

**Causa:** Username duplicado en localStorage

**Solución:**
```javascript
// Limpiar duplicados antes de migrar
const users = JSON.parse(localStorage.getItem('users') || '[]');
const unique = users.filter((u, i, arr) => 
  arr.findIndex(x => x.username === u.username) === i
);
localStorage.setItem('users', JSON.stringify(unique));
```

### Problema: "Token expirado"

**Solución:**
```javascript
// Hacer logout y login nuevamente
// El token se renovará automáticamente
```

### Problema: "Migración se quedó en un paso"

**Solución:**
1. Recargar la página
2. Abrir consola (F12) para ver errores
3. Verificar que las tablas existan en Supabase
4. Reintentar migración
5. Si persiste, migrar manualmente desde Supabase UI

---

## 📊 **MONITOREO Y LOGS**

### Ver Logs del Servidor

1. Ve a https://supabase.com/dashboard
2. **Functions > make-server-1fcaa2e7 > Logs**
3. Verás todas las requests en tiempo real

### Ver Logs del Frontend

```javascript
// Activar logs detallados
localStorage.setItem('debug', 'true');

// Ahora verás logs de:
// - Cada llamada a la API
// - Respuestas del servidor
// - Errores de autenticación
```

---

## 🎯 **PRÓXIMOS PASOS**

Una vez migrado exitosamente:

### Semana 1-2: Optimización
- [ ] Remover código de localStorage
- [ ] Implementar cache en frontend
- [ ] Agregar loading states mejores

### Semana 3: Features Nuevas
- [ ] Recuperación de contraseña
- [ ] Notificaciones por email
- [ ] Perfiles de usuario con foto

### Semana 4: Video Player
- [ ] Player 9:16 fullscreen funcional
- [ ] Tracking de progreso en tiempo real
- [ ] Autoplay siguiente video

### Semana 5: Paneles Restantes
- [ ] Completar EmpresaPanel
- [ ] Completar TrabajadorPanel
- [ ] Completar IndividualPanel

---

## 📞 **SOPORTE**

Si tienes problemas:

1. **Revisa los logs** (servidor + frontend)
2. **Consulta** `/SUPABASE_SETUP.md`
3. **Consulta** `/MIGRACION_GUIA.md`
4. **Revisa** este documento

---

## ✅ **CHECKLIST DE VERIFICACIÓN**

Antes de considerar la migración completa:

- [ ] Puedo hacer login con admin
- [ ] Puedo crear usuarios nuevos
- [ ] Los usuarios pueden hacer login
- [ ] Los cursos se muestran correctamente
- [ ] Puedo crear cursos nuevos
- [ ] Los paquetes se muestran
- [ ] El progreso se guarda
- [ ] El ranking funciona
- [ ] La sesión persiste al recargar
- [ ] Puedo acceder desde otro navegador
- [ ] Los datos están en Supabase (no localStorage)

---

**🎉 ¡Felicidades! Tu plataforma ahora tiene una arquitectura profesional y escalable.**

¿Siguiente paso? Completar los paneles faltantes y el video player 🚀
