# 🔄 Guía de Migración: localStorage → Supabase

Esta guía te ayudará a migrar todos tus datos existentes de `localStorage` a la base de datos Supabase.

---

## 📋 Antes de Empezar

### ✅ Checklist Pre-Migración

- [ ] Has creado tu proyecto en Supabase
- [ ] Has ejecutado todos los scripts SQL de `/SUPABASE_SETUP.md`
- [ ] Has creado el usuario admin inicial en Supabase
- [ ] El servidor backend está funcionando (`/make-server-1fcaa2e7/health` responde)
- [ ] Tienes un backup de tus datos de localStorage (opcional pero recomendado)

---

## 🎯 Proceso de Migración

### Opción 1: Migración Automática (Recomendada)

La plataforma incluye una función de migración automática que moverá todos tus datos:

1. **Abre la consola del navegador** (F12)

2. **Ejecuta este comando:**
   ```javascript
   // Importar la función de migración
   const { migrationAPI } = await import('./utils/api.tsx');
   
   // Ejecutar migración
   await migrationAPI.migrateFromLocalStorage();
   ```

3. **Observa los logs** en la consola:
   - ✅ = Dato migrado exitosamente
   - ❌ = Error (revisa el detalle)

4. **Verifica en Supabase** que los datos se migraron correctamente

5. **Limpia localStorage** (opcional, solo después de verificar):
   ```javascript
   migrationAPI.clearLocalStorage();
   ```

---

### Opción 2: Migración Manual

Si prefieres migrar manualmente o la opción automática falla:

#### 📊 Exportar Datos de localStorage

```javascript
// Ejecuta en consola del navegador
const backup = {
  users: JSON.parse(localStorage.getItem('users') || '[]'),
  cursos: JSON.parse(localStorage.getItem('cursos') || '[]'),
  paquetes: JSON.parse(localStorage.getItem('paquetes') || '[]'),
  timestamp: new Date().toISOString()
};

console.log('📦 Backup creado:', backup);
console.log('Total usuarios:', backup.users.length);
console.log('Total cursos:', backup.cursos.length);
console.log('Total paquetes:', backup.paquetes.length);

// Copiar al portapapeles (opcional)
copy(JSON.stringify(backup, null, 2));
```

#### 📥 Importar a Supabase

Usa el panel de administración de tu plataforma para recrear:

1. **Paquetes**: Ve a la pestaña "Paquetes" y crea cada uno
2. **Cursos**: Ve a la pestaña "Cursos" y crea cada uno con sus módulos
3. **Usuarios**: Ve a la pestaña "Usuarios" y crea cada uno

---

## 🔍 Verificación Post-Migración

### 1. Verificar Paquetes

```javascript
const { paquetesAPI } = await import('./utils/api.tsx');
const { paquetes } = await paquetesAPI.getAll();
console.log('📦 Paquetes en Supabase:', paquetes.length);
```

### 2. Verificar Cursos

```javascript
const { cursosAPI } = await import('./utils/api.tsx');
const { cursos } = await cursosAPI.getAll();
console.log('📚 Cursos en Supabase:', cursos.length);
```

### 3. Verificar Usuarios

```javascript
const { usersAPI } = await import('./utils/api.tsx');
const { users } = await usersAPI.getAll();
console.log('👥 Usuarios en Supabase:', users.length);
```

---

## ⚠️ Problemas Comunes

### Problema: "Usuario ya existe"

**Causa**: El username o email ya está registrado

**Solución**: 
- Verifica que no haya duplicados en tu localStorage
- Usa usernames únicos para cada usuario

### Problema: "No autenticado"

**Causa**: No has iniciado sesión como admin

**Solución**:
1. Haz login con el usuario admin
2. Vuelve a ejecutar la migración

### Problema: "Error de conexión"

**Causa**: El servidor Supabase no responde

**Solución**:
1. Verifica que tu proyecto Supabase esté activo
2. Revisa que las credenciales en `/utils/supabase/info.tsx` sean correctas
3. Prueba el endpoint: `https://TU_PROJECT_ID.supabase.co/functions/v1/make-server-1fcaa2e7/health`

### Problema: "Foreign key constraint"

**Causa**: Intentas crear un trabajador antes que su empresa

**Solución**:
- La migración automática ya respeta el orden correcto
- Si migras manualmente, crea en este orden:
  1. Paquetes
  2. Cursos
  3. Empresas
  4. Trabajadores
  5. Individuales

---

## 🔄 Estrategia de Transición

### Fase 1: Preparación (1 día)
- [ ] Configurar Supabase
- [ ] Crear tablas
- [ ] Probar endpoints básicos

### Fase 2: Migración (1 hora)
- [ ] Hacer backup de localStorage
- [ ] Ejecutar migración automática
- [ ] Verificar datos en Supabase

### Fase 3: Pruebas (1 día)
- [ ] Probar login con usuarios migrados
- [ ] Verificar que los cursos se vean correctamente
- [ ] Probar creación de nuevos datos
- [ ] Verificar el ranking

### Fase 4: Limpieza (después de 1 semana)
- [ ] Confirmar que todo funciona
- [ ] Limpiar localStorage
- [ ] Eliminar código de compatibilidad

---

## 🎉 Después de la Migración

### ✅ Beneficios Inmediatos

1. **Persistencia Real**: Los datos ya no se pierden al limpiar el navegador
2. **Multi-dispositivo**: Accede desde cualquier lugar
3. **Backups Automáticos**: Supabase hace respaldos diarios
4. **Mejor Performance**: Las queries SQL son más rápidas
5. **Seguridad**: Row Level Security protege los datos
6. **Escalabilidad**: Soporta miles de usuarios

### 🔧 Siguientes Pasos

1. Configurar el **Video Player** funcional
2. Completar los **paneles faltantes** (Empresa, Trabajador, Individual)
3. Implementar **sistema de pagos**
4. Agregar **notificaciones por email**
5. Crear **certificados PDF**

---

## 📞 Soporte

Si tienes problemas durante la migración:

1. **Revisa los logs** en la consola del navegador
2. **Verifica las tablas** en Supabase Dashboard
3. **Prueba los endpoints** manualmente en Postman/Thunder Client
4. **Revisa el servidor** en Supabase Functions logs

---

## 🔐 Notas de Seguridad

⚠️ **IMPORTANTE**:

- Las **contraseñas** en localStorage están en texto plano
- Al migrar a Supabase, se hashean automáticamente
- **No compartas** tu Service Role Key
- **No expongas** credenciales en el frontend
- Usa **HTTPS** en producción siempre

---

## 💾 Script de Backup Completo

Antes de cualquier migración, ejecuta esto para tener un backup:

```javascript
// Backup completo de localStorage
const backup = {
  fecha: new Date().toISOString(),
  users: localStorage.getItem('users'),
  cursos: localStorage.getItem('cursos'),
  paquetes: localStorage.getItem('paquetes'),
  progreso: localStorage.getItem('user_progress'),
  ranking: localStorage.getItem('ranking'),
};

// Descargar como archivo JSON
const dataStr = JSON.stringify(backup, null, 2);
const dataBlob = new Blob([dataStr], { type: 'application/json' });
const url = URL.createObjectURL(dataBlob);
const link = document.createElement('a');
link.href = url;
link.download = `backup-localStorage-${new Date().toISOString().split('T')[0]}.json`;
link.click();

console.log('💾 Backup descargado!');
```

---

**¡Buena suerte con tu migración!** 🚀

Si algo falla, siempre tienes tu backup de localStorage para restaurar.
