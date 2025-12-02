# 📋 Configuración de Base de Datos en Supabase

## Importante
Antes de usar la plataforma, debes crear las tablas en Supabase. Sigue estos pasos:

---

## 🚀 Paso 1: Acceder al SQL Editor

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Click en **"SQL Editor"** en el menú lateral
3. Click en **"New Query"**

---

## 📝 Paso 2: Ejecutar el siguiente SQL

Copia y pega este script completo en el editor y haz click en **"Run"**:

```sql
-- ============================================
-- TABLA: users_platform
-- Almacena todos los usuarios de la plataforma
-- ============================================
CREATE TABLE IF NOT EXISTS users_platform (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  codigo TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('admin', 'empresa', 'trabajador', 'individual')),
  
  -- Información personal
  nombre_completo TEXT,
  tipo_documento TEXT,
  numero_documento TEXT,
  email TEXT,
  telefono TEXT,
  ciudad TEXT,
  
  -- Relaciones
  empresa_id UUID REFERENCES users_platform(id) ON DELETE SET NULL,
  paquete_id UUID,
  
  -- Para empresas
  cantidad_miembros INTEGER,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users_platform(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_type ON users_platform(type);
CREATE INDEX IF NOT EXISTS idx_users_empresa_id ON users_platform(empresa_id);
CREATE INDEX IF NOT EXISTS idx_users_codigo ON users_platform(codigo);

-- ============================================
-- TABLA: empresas
-- Información adicional de empresas
-- ============================================
CREATE TABLE IF NOT EXISTS empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_platform(id) ON DELETE CASCADE,
  nombre_empresa TEXT NOT NULL,
  nit TEXT,
  persona_contacto TEXT,
  limite_empleados INTEGER DEFAULT 10,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_empresas_user_id ON empresas(user_id);

-- ============================================
-- TABLA: cursos
-- Cursos disponibles en la plataforma
-- ============================================
CREATE TABLE IF NOT EXISTS cursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  thumbnail TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: modulos
-- Módulos de cada curso
-- ============================================
CREATE TABLE IF NOT EXISTS modulos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  orden INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_modulos_curso_id ON modulos(curso_id);

-- ============================================
-- TABLA: videos
-- Videos de cada módulo
-- ============================================
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_id UUID REFERENCES modulos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  url TEXT NOT NULL,
  duracion INTEGER, -- En segundos
  orden INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_videos_modulo_id ON videos(modulo_id);

-- ============================================
-- TABLA: paquetes
-- Paquetes de cursos que pueden comprar las empresas
-- ============================================
CREATE TABLE IF NOT EXISTS paquetes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio NUMERIC(10, 2) NOT NULL,
  duracion TEXT, -- "1 mes", "3 meses", etc.
  nivel TEXT CHECK (nivel IN ('Básico', 'Intermedio', 'Avanzado', 'Profesional')),
  caracteristicas JSONB DEFAULT '[]'::jsonb,
  cursos_ids JSONB DEFAULT '[]'::jsonb,
  destacado BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: video_completions
-- Registra qué videos ha completado cada usuario
-- ============================================
CREATE TABLE IF NOT EXISTS video_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_platform(id) ON DELETE CASCADE,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Evitar duplicados: un usuario solo puede completar un video una vez
  UNIQUE(user_id, video_id)
);

CREATE INDEX IF NOT EXISTS idx_video_completions_user_id ON video_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_video_completions_video_id ON video_completions(video_id);

-- ============================================
-- TABLA: user_progress
-- Progreso de cada usuario en cada curso
-- ============================================
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_platform(id) ON DELETE CASCADE,
  curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
  videos_completados INTEGER DEFAULT 0,
  total_videos INTEGER DEFAULT 0,
  porcentaje_completado INTEGER DEFAULT 0,
  ultima_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Un usuario solo puede tener un registro de progreso por curso
  UNIQUE(user_id, curso_id)
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_curso_id ON user_progress(curso_id);

-- ============================================
-- TABLA: ranking_monthly
-- Ranking mensual de usuarios (estilo Duolingo)
-- ============================================
CREATE TABLE IF NOT EXISTS ranking_monthly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_platform(id) ON DELETE CASCADE,
  empresa_id UUID REFERENCES users_platform(id) ON DELETE SET NULL,
  month INTEGER NOT NULL, -- 1-12
  year INTEGER NOT NULL, -- 2025, 2026, etc.
  puntos INTEGER DEFAULT 0,
  cursos_completados INTEGER DEFAULT 0,
  videos_completados INTEGER DEFAULT 0,
  tiempo_total INTEGER DEFAULT 0, -- En minutos
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Un usuario solo puede tener un registro por mes/año
  UNIQUE(user_id, month, year)
);

CREATE INDEX IF NOT EXISTS idx_ranking_monthly_user_id ON ranking_monthly(user_id);
CREATE INDEX IF NOT EXISTS idx_ranking_monthly_empresa_id ON ranking_monthly(empresa_id);
CREATE INDEX IF NOT EXISTS idx_ranking_monthly_month_year ON ranking_monthly(month, year);

-- ============================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE users_platform ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE paquetes ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranking_monthly ENABLE ROW LEVEL SECURITY;

-- Políticas para service_role (backend tiene acceso total)
CREATE POLICY "Service role has full access" ON users_platform FOR ALL USING (true);
CREATE POLICY "Service role has full access" ON empresas FOR ALL USING (true);
CREATE POLICY "Service role has full access" ON cursos FOR ALL USING (true);
CREATE POLICY "Service role has full access" ON modulos FOR ALL USING (true);
CREATE POLICY "Service role has full access" ON videos FOR ALL USING (true);
CREATE POLICY "Service role has full access" ON paquetes FOR ALL USING (true);
CREATE POLICY "Service role has full access" ON video_completions FOR ALL USING (true);
CREATE POLICY "Service role has full access" ON user_progress FOR ALL USING (true);
CREATE POLICY "Service role has full access" ON ranking_monthly FOR ALL USING (true);

-- ============================================
-- USUARIO ADMINISTRADOR INICIAL
-- ============================================

-- El usuario admin se debe crear manualmente en el Auth de Supabase
-- Email: admin@plataforma.local
-- Password: UraMarketing2025*

-- Después de crear el usuario en Auth, ejecuta esto (reemplaza 'AUTH_USER_ID' con el ID real):
-- INSERT INTO users_platform (auth_user_id, username, codigo, type, nombre_completo)
-- VALUES ('AUTH_USER_ID', 'admin', 'ADMIN-1', 'admin', 'Administrador');
```

---

## ✅ Paso 3: Crear Usuario Administrador

1. Ve a **"Authentication" > "Users"** en Supabase Dashboard
2. Click en **"Add user"** > **"Create new user"**
3. Configura:
   - Email: `admin@plataforma.local`
   - Password: `UraMarketing2025*`
   - ✅ Auto Confirm User: **Activado**
4. Click en **"Create user"**
5. **Copia el UUID del usuario creado**

6. Regresa al **SQL Editor** y ejecuta (reemplazando `'AQUI_EL_UUID_DEL_ADMIN'`):

```sql
INSERT INTO users_platform (auth_user_id, username, codigo, type, nombre_completo)
VALUES ('AQUI_EL_UUID_DEL_ADMIN', 'admin', 'ADMIN-1', 'admin', 'Administrador');
```

---

## 🎉 ¡Listo!

Tu base de datos está configurada. Ahora puedes:

1. Iniciar sesión con: `admin` / `UraMarketing2025*`
2. Crear cursos, paquetes y usuarios
3. Todo se guardará en Supabase (base de datos real)

---

## 🔧 Troubleshooting

### Error: "relation already exists"
- No te preocupes, significa que la tabla ya existe. Continúa con el siguiente paso.

### Error: "permission denied"
- Asegúrate de estar ejecutando el SQL como administrador del proyecto.

### Error al hacer login
- Verifica que creaste el usuario admin en Authentication
- Verifica que ejecutaste el INSERT con el UUID correcto
- Revisa la consola del navegador para ver errores específicos

---

## 📊 Estructura de Datos

```
users_platform (usuarios de la plataforma)
  ├── empresas (info adicional de empresas)
  ├── cursos
  │    ├── modulos
  │    │    └── videos
  │    └── user_progress
  ├── paquetes
  ├── video_completions
  └── ranking_monthly
```

---

## 🔒 Seguridad

- ✅ Autenticación JWT con Supabase Auth
- ✅ Row Level Security (RLS) habilitado
- ✅ Service Role Key solo en backend
- ✅ Anon Key seguro para frontend
- ✅ Contraseñas hasheadas automáticamente
