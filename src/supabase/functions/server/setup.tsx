import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// SQL para crear todas las tablas
const CREATE_TABLES_SQL = `
-- Tabla principal de usuarios
CREATE TABLE IF NOT EXISTS users_platform (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  codigo TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('admin', 'empresa', 'trabajador', 'individual')),
  nombre_completo TEXT,
  tipo_documento TEXT,
  numero_documento TEXT,
  email TEXT,
  telefono TEXT,
  ciudad TEXT,
  empresa_id UUID REFERENCES users_platform(id) ON DELETE SET NULL,
  paquete_id UUID,
  cantidad_miembros INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users_platform(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_type ON users_platform(type);
CREATE INDEX IF NOT EXISTS idx_users_empresa_id ON users_platform(empresa_id);

-- Tabla de empresas
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

-- Tabla de cursos
CREATE TABLE IF NOT EXISTS cursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  thumbnail TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de módulos
CREATE TABLE IF NOT EXISTS modulos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_modulos_curso_id ON modulos(curso_id);

-- Tabla de videos
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_id UUID REFERENCES modulos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  url TEXT NOT NULL,
  duracion INTEGER,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_videos_modulo_id ON videos(modulo_id);

-- Tabla de paquetes
CREATE TABLE IF NOT EXISTS paquetes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio NUMERIC(10, 2) NOT NULL,
  duracion TEXT,
  nivel TEXT CHECK (nivel IN ('Básico', 'Intermedio', 'Avanzado', 'Profesional')),
  caracteristicas JSONB DEFAULT '[]'::jsonb,
  cursos_ids JSONB DEFAULT '[]'::jsonb,
  destacado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de videos completados
CREATE TABLE IF NOT EXISTS video_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_platform(id) ON DELETE CASCADE,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

CREATE INDEX IF NOT EXISTS idx_video_completions_user_id ON video_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_video_completions_video_id ON video_completions(video_id);

-- Tabla de progreso de usuarios
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_platform(id) ON DELETE CASCADE,
  curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
  videos_completados INTEGER DEFAULT 0,
  total_videos INTEGER DEFAULT 0,
  porcentaje_completado INTEGER DEFAULT 0,
  ultima_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, curso_id)
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_curso_id ON user_progress(curso_id);

-- Tabla de ranking mensual
CREATE TABLE IF NOT EXISTS ranking_monthly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_platform(id) ON DELETE CASCADE,
  empresa_id UUID REFERENCES users_platform(id) ON DELETE SET NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  puntos INTEGER DEFAULT 0,
  cursos_completados INTEGER DEFAULT 0,
  videos_completados INTEGER DEFAULT 0,
  tiempo_total INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);

CREATE INDEX IF NOT EXISTS idx_ranking_monthly_user_id ON ranking_monthly(user_id);
CREATE INDEX IF NOT EXISTS idx_ranking_monthly_empresa_id ON ranking_monthly(empresa_id);
CREATE INDEX IF NOT EXISTS idx_ranking_monthly_month_year ON ranking_monthly(month, year);
`;

export async function createTables() {
  console.log('🔨 Creando tablas en Supabase...');
  
  const errors: string[] = [];
  const success: string[] = [];

  try {
    // Usar el Postgres client de Deno para ejecutar DDL
    const { Client } = await import("https://deno.land/x/postgres@v0.17.0/mod.ts");
    
    const dbUrl = Deno.env.get('SUPABASE_DB_URL');
    if (!dbUrl) {
      errors.push('SUPABASE_DB_URL no está configurada');
      return { success: false, errors, successMessages: success };
    }

    console.log('📡 Conectando a la base de datos...');
    const client = new Client(dbUrl);
    await client.connect();

    console.log('🔨 Ejecutando DDL...');
    await client.queryArray(CREATE_TABLES_SQL);

    await client.end();

    success.push('✅ Todas las tablas creadas correctamente');
    console.log('✅ Tablas creadas exitosamente');
    return { success: true, errors, successMessages: success };

  } catch (error) {
    console.error('Error creando tablas:', error);
    errors.push(`Error creando tablas: ${error.message || error}`);
    errors.push('Intenta ejecutar el SQL manualmente en el SQL Editor de Supabase.');
    return { success: false, errors, successMessages: success };
  }
}

export async function setupDatabase() {
  console.log('🚀 Iniciando configuración automática de base de datos...');
  
  const errors: string[] = [];
  const success: string[] = [];

  try {
    // 1. Verificar si las tablas existen intentando hacer una query
    const { data: testUsers, error: testError } = await supabase
      .from('users_platform')
      .select('count')
      .limit(1);

    if (testError) {
      if (testError.code === '42P01' || testError.code === 'PGRST204' || testError.code === 'PGRST205') {
        // Las tablas no existen - intentar crearlas automáticamente
        console.log('⚠️ Tablas no encontradas. Intentando crear automáticamente...');
        
        const createResult = await createTables();
        
        if (!createResult.success) {
          errors.push('Las tablas no existen y no se pudieron crear automáticamente.');
          errors.push('Por favor, ejecuta el SQL manualmente en el SQL Editor de Supabase.');
          return { success: false, errors, successMessages: success };
        }
        
        success.push(...createResult.successMessages);
      } else {
        // Otro tipo de error
        errors.push(`Error al verificar tablas: ${testError.message}`);
        return { success: false, errors, successMessages: success };
      }
    } else {
      success.push('✅ Tablas verificadas correctamente');
    }

    // 2. Verificar si ya existe un usuario admin
    const { data: existingAdmin } = await supabase
      .from('users_platform')
      .select('*')
      .eq('username', 'admin')
      .single();

    if (existingAdmin) {
      success.push('✅ Usuario admin ya existe');
      return { success: true, errors, successMessages: success, adminExists: true };
    }

    // 3. Crear usuario admin en Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@plataforma.local',
      password: 'UraMarketing2025*',
      email_confirm: true,
      user_metadata: {
        username: 'admin',
        type: 'admin',
      }
    });

    if (authError) {
      // Si el error es que el usuario ya existe, intentar obtenerlo
      if (authError.message.includes('already registered')) {
        success.push('✅ Usuario admin ya existe en Auth');
        
        // Buscar el usuario por email
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const adminAuthUser = users?.find(u => u.email === 'admin@plataforma.local');
        
        if (adminAuthUser) {
          // Verificar si ya tiene registro en users_platform
          const { data: existingPlatformUser } = await supabase
            .from('users_platform')
            .select('*')
            .eq('auth_user_id', adminAuthUser.id)
            .single();

          if (!existingPlatformUser) {
            // Crear registro en users_platform
            const { error: insertError } = await supabase
              .from('users_platform')
              .insert({
                auth_user_id: adminAuthUser.id,
                username: 'admin',
                codigo: 'ADMIN-1',
                type: 'admin',
                nombre_completo: 'Administrador',
              });

            if (insertError) {
              errors.push(`Error creando registro de admin: ${insertError.message}`);
            } else {
              success.push('✅ Registro de admin creado en users_platform');
            }
          } else {
            success.push('✅ Admin ya tiene registro en users_platform');
          }
        }
      } else {
        errors.push(`Error creando usuario admin en Auth: ${authError.message}`);
        return { success: false, errors, successMessages: success };
      }
    } else {
      success.push('✅ Usuario admin creado en Auth');

      // 4. Crear registro en users_platform
      const { error: insertError } = await supabase
        .from('users_platform')
        .insert({
          auth_user_id: authData.user.id,
          username: 'admin',
          codigo: 'ADMIN-1',
          type: 'admin',
          nombre_completo: 'Administrador',
        });

      if (insertError) {
        errors.push(`Error creando registro de admin: ${insertError.message}`);
        // Intentar eliminar el usuario de Auth si falla
        await supabase.auth.admin.deleteUser(authData.user.id);
        return { success: false, errors, successMessages: success };
      }

      success.push('✅ Registro de admin creado en users_platform');
    }

    return { 
      success: true, 
      errors, 
      successMessages: success,
      message: '🎉 Configuración completada exitosamente'
    };

  } catch (error) {
    console.error('Error en setupDatabase:', error);
    errors.push(`Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    return { success: false, errors, successMessages: success };
  }
}

// Función para ejecutar SQL directamente (requiere rpc)
export async function createTablesSQL() {
  const sqlStatements = [
    // Tabla users_platform
    `CREATE TABLE IF NOT EXISTS users_platform (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      username TEXT UNIQUE NOT NULL,
      codigo TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('admin', 'empresa', 'trabajador', 'individual')),
      nombre_completo TEXT,
      tipo_documento TEXT,
      numero_documento TEXT,
      email TEXT,
      telefono TEXT,
      ciudad TEXT,
      empresa_id UUID REFERENCES users_platform(id) ON DELETE SET NULL,
      paquete_id UUID,
      cantidad_miembros INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    
    // Índices
    `CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users_platform(auth_user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_users_type ON users_platform(type)`,
    `CREATE INDEX IF NOT EXISTS idx_users_empresa_id ON users_platform(empresa_id)`,
    
    // Tabla empresas
    `CREATE TABLE IF NOT EXISTS empresas (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users_platform(id) ON DELETE CASCADE,
      nombre_empresa TEXT NOT NULL,
      nit TEXT,
      persona_contacto TEXT,
      limite_empleados INTEGER DEFAULT 10,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    
    // Tabla cursos
    `CREATE TABLE IF NOT EXISTS cursos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      titulo TEXT NOT NULL,
      descripcion TEXT,
      thumbnail TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    
    // Tabla modulos
    `CREATE TABLE IF NOT EXISTS modulos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
      titulo TEXT NOT NULL,
      orden INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    
    `CREATE INDEX IF NOT EXISTS idx_modulos_curso_id ON modulos(curso_id)`,
    
    // Tabla videos
    `CREATE TABLE IF NOT EXISTS videos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      modulo_id UUID REFERENCES modulos(id) ON DELETE CASCADE,
      titulo TEXT NOT NULL,
      url TEXT NOT NULL,
      duracion INTEGER,
      orden INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    
    `CREATE INDEX IF NOT EXISTS idx_videos_modulo_id ON videos(modulo_id)`,
    
    // Tabla paquetes
    `CREATE TABLE IF NOT EXISTS paquetes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      nombre TEXT NOT NULL,
      descripcion TEXT,
      precio NUMERIC(10, 2) NOT NULL,
      duracion TEXT,
      nivel TEXT CHECK (nivel IN ('Básico', 'Intermedio', 'Avanzado', 'Profesional')),
      caracteristicas JSONB DEFAULT '[]'::jsonb,
      cursos_ids JSONB DEFAULT '[]'::jsonb,
      destacado BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    
    // Tabla video_completions
    `CREATE TABLE IF NOT EXISTS video_completions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users_platform(id) ON DELETE CASCADE,
      video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
      completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, video_id)
    )`,
    
    `CREATE INDEX IF NOT EXISTS idx_video_completions_user_id ON video_completions(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_video_completions_video_id ON video_completions(video_id)`,
    
    // Tabla user_progress
    `CREATE TABLE IF NOT EXISTS user_progress (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users_platform(id) ON DELETE CASCADE,
      curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
      videos_completados INTEGER DEFAULT 0,
      total_videos INTEGER DEFAULT 0,
      porcentaje_completado INTEGER DEFAULT 0,
      ultima_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, curso_id)
    )`,
    
    `CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_user_progress_curso_id ON user_progress(curso_id)`,
    
    // Tabla ranking_monthly
    `CREATE TABLE IF NOT EXISTS ranking_monthly (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users_platform(id) ON DELETE CASCADE,
      empresa_id UUID REFERENCES users_platform(id) ON DELETE SET NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      puntos INTEGER DEFAULT 0,
      cursos_completados INTEGER DEFAULT 0,
      videos_completados INTEGER DEFAULT 0,
      tiempo_total INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, month, year)
    )`,
    
    `CREATE INDEX IF NOT EXISTS idx_ranking_monthly_user_id ON ranking_monthly(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_ranking_monthly_empresa_id ON ranking_monthly(empresa_id)`,
    `CREATE INDEX IF NOT EXISTS idx_ranking_monthly_month_year ON ranking_monthly(month, year)`,
  ];

  // Nota: Supabase no permite ejecutar SQL directamente desde el cliente
  // Estas statements necesitan ser ejecutadas manualmente en el SQL Editor
  return sqlStatements;
}
