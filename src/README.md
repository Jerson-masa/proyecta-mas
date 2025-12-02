# 🎓 Plataforma de Cursos Móvil

Plataforma de cursos en formato móvil con 4 paneles diferentes y sistema de ranking estilo Duolingo.

## ✨ Características

### 🎯 4 Paneles de Usuario
- **Administrador**: Crea y gestiona cursos, módulos, paquetes y empresas
- **Empresas**: Ve estadísticas de trabajadores y ranking
- **Trabajador**: Toma cursos y compite en el ranking
- **Individual**: Toma cursos (sin ranking)

### 📱 Experiencia Móvil
- Cursos en formato **9:16** (pantalla completa móvil)
- Diseño completamente responsive
- Esquinas muy redondeadas
- Colores azul/morado (#4F46E5, #7C3AED)
- Fondo degradado suave

### 🏆 Sistema de Ranking
- Competencia estilo Duolingo
- Trofeos para los 3 primeros lugares
- Estadísticas mensuales y de todo el tiempo
- Visible en paneles Admin, Empresa y Trabajador

### 📚 Sistema de Cursos
- Cursos con múltiples módulos
- Sistema de progreso
- Puntos por completar cursos
- Inscripción directa

## 🚀 Cómo Usar

### 1. Crear Usuario Administrador
1. Haz clic en "¿No tienes cuenta? Regístrate"
2. Completa el formulario:
   - Nombre: Tu nombre
   - Email: admin@ejemplo.com
   - Contraseña: tu contraseña segura
   - **Tipo de cuenta: Administrador**
3. Haz clic en "Crear cuenta"

### 2. Crear Cursos de Ejemplo
1. Una vez en el Panel Administrador
2. Haz clic en el botón **"✨ Crear Cursos de Ejemplo"**
3. Esto creará 4 cursos completos automáticamente:
   - Introducción a React (4 módulos)
   - JavaScript Avanzado (3 módulos)
   - Diseño UX/UI Moderno (3 módulos)
   - Marketing Digital (4 módulos)

### 3. Crear Otros Usuarios
Crea diferentes tipos de cuentas para probar:

**Usuario Trabajador:**
- Email: trabajador@ejemplo.com
- Tipo: Trabajador

**Usuario Individual:**
- Email: individual@ejemplo.com
- Tipo: Individual

**Usuario Empresa:**
- Email: empresa@ejemplo.com
- Tipo: Empresa

### 4. Explorar la Plataforma

**Como Trabajador o Individual:**
1. Ve a la pestaña "Explorar"
2. Selecciona un curso
3. Haz clic en "Inscribirse"
4. Ve a "Mis Cursos"
5. Haz clic en "Comenzar" o "Continuar"
6. Completa los módulos haciendo clic en "Completar"

**Como Empresa:**
1. Ve a "Estadísticas" para ver trabajadores
2. Ve a "Ranking" para ver la competencia

**Como Admin:**
1. Crea más cursos manualmente
2. Gestiona paquetes
3. Ve el ranking global

## 🛠️ Tecnologías

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase Edge Functions (Hono)
- **Base de Datos**: Supabase KV Store
- **Autenticación**: Supabase Auth (JWT)
- **Iconos**: Lucide React

## 📊 Estructura de Datos

### Usuarios
```typescript
{
  id: string
  email: string
  name: string
  role: 'admin' | 'company' | 'worker' | 'individual'
  companyId: string | null
  points: number
  completedCourses: number
}
```

### Cursos
```typescript
{
  id: string
  title: string
  description: string
  category: string
  level: 'Principiante' | 'Intermedio' | 'Avanzado'
  points: number
  modules: Module[]
}
```

### Ranking
```typescript
{
  userId: string
  name: string
  points: number
  completedCourses: number
  monthlyPoints: number
  rank: number
}
```

## 🎨 Diseño

- **Colores principales**: 
  - Indigo: #4F46E5
  - Morado: #7C3AED
- **Border Radius**: 16px - 32px (muy redondeado)
- **Formato de video**: 9:16 (móvil vertical)
- **Degradados**: Suaves entre azul y morado

## 💡 Próximas Funcionalidades

- [ ] Sistema de paquetes para empresas
- [ ] Gestión completa de empresas
- [ ] Videos reales integrados
- [ ] Certificados al completar cursos
- [ ] Notificaciones en tiempo real
- [ ] Chat entre estudiantes

---

**¡Empieza a crear tu academia online ahora! 🚀**
