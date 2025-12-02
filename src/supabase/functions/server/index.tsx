import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// ============================================
// HELPER FUNCTIONS
// ============================================

// Generate unique user code based on role
async function generateUserCode(role: string, companyId?: string) {
  if (role === 'individual') {
    // Get all individuals to count them
    const allUsers = await kv.getByPrefix('user:');
    const individuals = allUsers.filter(u => u.role === 'individual');
    const count = individuals.length + 1;
    return `IND-${String(count).padStart(2, '0')}`;
  } else if (role === 'company') {
    // Get all companies to count them
    const allUsers = await kv.getByPrefix('user:');
    const companies = allUsers.filter(u => u.role === 'company');
    const count = companies.length + 1;
    return `EMP-${String(count).padStart(2, '0')}`;
  } else if (role === 'worker' && companyId) {
    // Get company code
    const company = await kv.get(`user:${companyId}`);
    const companyCode = company?.userCode || 'EMP-00';
    
    // Get all workers from this company to count them
    const allUsers = await kv.getByPrefix('user:');
    const companyWorkers = allUsers.filter(u => u.role === 'worker' && u.companyId === companyId);
    const count = companyWorkers.length + 1;
    return `${companyCode}-T${count}`;
  }
  return '';
}

// ============================================
// AUTH ROUTES
// ============================================

// Signup
app.post('/make-server-1fcaa2e7/auth/signup', async (c) => {
  try {
    const { email, password, name, role, companyId } = await c.req.json();

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since email server not configured
      user_metadata: { name, role }
    });

    if (authError) {
      console.log('Signup error:', authError);
      return c.json({ error: authError.message }, 400);
    }

    // Generate user code
    const userCode = await generateUserCode(role, companyId);

    // Store user profile in KV
    const userId = authData.user.id;
    await kv.set(`user:${userId}`, {
      id: userId,
      email,
      name,
      role, // 'admin', 'company', 'worker', 'individual'
      userCode, // IND-01, EMP-01, EMP-01-T1, etc.
      companyId: companyId || null,
      createdAt: new Date().toISOString(),
      points: 0,
      completedCourses: 0
    });

    // Initialize ranking entry
    await kv.set(`ranking:${userId}`, {
      userId,
      name,
      points: 0,
      completedCourses: 0,
      lastUpdated: new Date().toISOString(),
      monthlyPoints: 0,
      rank: 0
    });

    return c.json({ 
      user: authData.user,
      message: 'Usuario creado exitosamente'
    });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// USER ROUTES
// ============================================

// Get current user profile
app.get('/make-server-1fcaa2e7/users/me', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    return c.json({ user: profile });
  } catch (error) {
    console.log('Get user error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Update user profile
app.put('/make-server-1fcaa2e7/users/me', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const updates = await c.req.json();
    const profile = await kv.get(`user:${user.id}`);
    
    const updatedProfile = { ...profile, ...updates };
    await kv.set(`user:${user.id}`, updatedProfile);

    return c.json({ user: updatedProfile });
  } catch (error) {
    console.log('Update user error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get all users (Admin only)
app.get('/make-server-1fcaa2e7/users', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    if (profile.role !== 'admin') {
      return c.json({ error: 'Solo administradores pueden ver usuarios' }, 403);
    }

    const allUsers = await kv.getByPrefix('user:');
    
    // Separar usuarios por tipo
    const individuals = allUsers.filter(u => u.role === 'individual');
    const workers = allUsers.filter(u => u.role === 'worker');
    const companies = allUsers.filter(u => u.role === 'company');

    return c.json({ 
      users: allUsers,
      individuals,
      workers,
      companies
    });
  } catch (error) {
    console.log('Get all users error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Update any user (Admin only)
app.put('/make-server-1fcaa2e7/users/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    if (profile.role !== 'admin') {
      return c.json({ error: 'Solo administradores pueden actualizar usuarios' }, 403);
    }

    const userId = c.req.param('id');
    const updates = await c.req.json();
    
    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile) {
      return c.json({ error: 'Usuario no encontrado' }, 404);
    }

    const updatedProfile = { ...userProfile, ...updates, id: userId };
    await kv.set(`user:${userId}`, updatedProfile);

    return c.json({ user: updatedProfile, message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    console.log('Update user error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// COURSE ROUTES (Admin only)
// ============================================

// Create course
app.post('/make-server-1fcaa2e7/courses', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    if (profile.role !== 'admin') {
      return c.json({ error: 'Solo administradores pueden crear cursos' }, 403);
    }

    const courseData = await c.req.json();
    const courseId = `course_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const course = {
      id: courseId,
      ...courseData,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      enrollments: 0
    };

    await kv.set(`course:${courseId}`, course);

    return c.json({ course });
  } catch (error) {
    console.log('Create course error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get all courses
app.get('/make-server-1fcaa2e7/courses', async (c) => {
  try {
    const courses = await kv.getByPrefix('course:');
    return c.json({ courses });
  } catch (error) {
    console.log('Get courses error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get single course
app.get('/make-server-1fcaa2e7/courses/:id', async (c) => {
  try {
    const courseId = c.req.param('id');
    const course = await kv.get(`course:${courseId}`);
    
    if (!course) {
      return c.json({ error: 'Curso no encontrado' }, 404);
    }

    return c.json({ course });
  } catch (error) {
    console.log('Get course error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Update course
app.put('/make-server-1fcaa2e7/courses/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    if (profile.role !== 'admin') {
      return c.json({ error: 'Solo administradores pueden actualizar cursos' }, 403);
    }

    const courseId = c.req.param('id');
    const updates = await c.req.json();
    const course = await kv.get(`course:${courseId}`);

    if (!course) {
      return c.json({ error: 'Curso no encontrado' }, 404);
    }

    const updatedCourse = { ...course, ...updates, updatedAt: new Date().toISOString() };
    await kv.set(`course:${courseId}`, updatedCourse);

    return c.json({ course: updatedCourse });
  } catch (error) {
    console.log('Update course error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Delete course
app.delete('/make-server-1fcaa2e7/courses/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    if (profile.role !== 'admin') {
      return c.json({ error: 'Solo administradores pueden eliminar cursos' }, 403);
    }

    const courseId = c.req.param('id');
    await kv.del(`course:${courseId}`);

    return c.json({ message: 'Curso eliminado exitosamente' });
  } catch (error) {
    console.log('Delete course error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// PACKAGE ROUTES (Admin only)
// ============================================

// Create package
app.post('/make-server-1fcaa2e7/packages', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    if (profile.role !== 'admin') {
      return c.json({ error: 'Solo administradores pueden crear paquetes' }, 403);
    }

    const packageData = await c.req.json();
    const packageId = `package_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const pkg = {
      id: packageId,
      ...packageData,
      createdBy: user.id,
      createdAt: new Date().toISOString()
    };

    await kv.set(`package:${packageId}`, pkg);

    return c.json({ package: pkg });
  } catch (error) {
    console.log('Create package error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get all packages
app.get('/make-server-1fcaa2e7/packages', async (c) => {
  try {
    const packages = await kv.getByPrefix('package:');
    return c.json({ packages });
  } catch (error) {
    console.log('Get packages error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Delete package
app.delete('/make-server-1fcaa2e7/packages/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    if (profile.role !== 'admin') {
      return c.json({ error: 'Solo administradores pueden eliminar paquetes' }, 403);
    }

    const packageId = c.req.param('id');
    await kv.del(`package:${packageId}`);

    return c.json({ success: true, message: 'Paquete eliminado exitosamente' });
  } catch (error) {
    console.log('Delete package error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// ENROLLMENT ROUTES
// ============================================

// Enroll in course
app.post('/make-server-1fcaa2e7/enrollments', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const { courseId } = await c.req.json();
    const enrollmentId = `enrollment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const enrollment = {
      id: enrollmentId,
      userId: user.id,
      courseId,
      enrolledAt: new Date().toISOString(),
      progress: 0,
      completed: false,
      currentModule: 0
    };

    await kv.set(`enrollment:${enrollmentId}`, enrollment);
    await kv.set(`enrollment:user:${user.id}:course:${courseId}`, enrollmentId);

    // Update course enrollments count
    const course = await kv.get(`course:${courseId}`);
    if (course) {
      course.enrollments = (course.enrollments || 0) + 1;
      await kv.set(`course:${courseId}`, course);
    }

    return c.json({ enrollment });
  } catch (error) {
    console.log('Enroll error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get user enrollments
app.get('/make-server-1fcaa2e7/enrollments/my', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const allEnrollments = await kv.getByPrefix('enrollment:');
    const userEnrollments = allEnrollments.filter(e => 
      e.id && e.id.startsWith('enrollment_') && e.userId === user.id
    );

    // Get course details for each enrollment
    const enrollmentsWithCourses = await Promise.all(
      userEnrollments.map(async (enrollment) => {
        const course = await kv.get(`course:${enrollment.courseId}`);
        return { ...enrollment, course };
      })
    );

    return c.json({ enrollments: enrollmentsWithCourses });
  } catch (error) {
    console.log('Get enrollments error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Update enrollment progress
app.put('/make-server-1fcaa2e7/enrollments/:id/progress', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const enrollmentId = c.req.param('id');
    const { progress, currentModule, completed } = await c.req.json();

    const enrollment = await kv.get(`enrollment:${enrollmentId}`);
    if (!enrollment || enrollment.userId !== user.id) {
      return c.json({ error: 'Matrícula no encontrada' }, 404);
    }

    enrollment.progress = progress;
    enrollment.currentModule = currentModule;
    
    // If course completed, update points and ranking
    if (completed && !enrollment.completed) {
      enrollment.completed = true;
      enrollment.completedAt = new Date().toISOString();

      // Get course to calculate points
      const course = await kv.get(`course:${enrollment.courseId}`);
      const points = course?.points || 100;

      // Update user profile
      const profile = await kv.get(`user:${user.id}`);
      profile.points = (profile.points || 0) + points;
      profile.completedCourses = (profile.completedCourses || 0) + 1;
      await kv.set(`user:${user.id}`, profile);

      // Update ranking
      const ranking = await kv.get(`ranking:${user.id}`);
      if (ranking) {
        ranking.points = profile.points;
        ranking.completedCourses = profile.completedCourses;
        ranking.monthlyPoints = (ranking.monthlyPoints || 0) + points;
        ranking.lastUpdated = new Date().toISOString();
        await kv.set(`ranking:${user.id}`, ranking);
      }
    }

    await kv.set(`enrollment:${enrollmentId}`, enrollment);

    return c.json({ enrollment });
  } catch (error) {
    console.log('Update progress error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// RANKING ROUTES
// ============================================

// Get rankings
app.get('/make-server-1fcaa2e7/rankings', async (c) => {
  try {
    const allRankings = await kv.getByPrefix('ranking:');
    
    // Sort by points (descending)
    const sortedRankings = allRankings
      .filter(r => r.userId) // Only valid ranking entries
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .map((r, index) => ({ ...r, rank: index + 1 }));

    return c.json({ rankings: sortedRankings });
  } catch (error) {
    console.log('Get rankings error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get monthly rankings
app.get('/make-server-1fcaa2e7/rankings/monthly', async (c) => {
  try {
    const allRankings = await kv.getByPrefix('ranking:');
    
    // Sort by monthly points (descending)
    const sortedRankings = allRankings
      .filter(r => r.userId)
      .sort((a, b) => (b.monthlyPoints || 0) - (a.monthlyPoints || 0))
      .map((r, index) => ({ ...r, rank: index + 1 }));

    return c.json({ rankings: sortedRankings });
  } catch (error) {
    console.log('Get monthly rankings error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// COMPANY ROUTES
// ============================================

// Create company (Admin only)
app.post('/make-server-1fcaa2e7/companies', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    if (profile.role !== 'admin') {
      return c.json({ error: 'Solo administradores pueden crear empresas' }, 403);
    }

    const companyData = await c.req.json();
    const companyId = `company_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const company = {
      id: companyId,
      ...companyData,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      workersCount: 0
    };

    await kv.set(`company:${companyId}`, company);

    return c.json({ company });
  } catch (error) {
    console.log('Create company error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get all companies (Admin only)
app.get('/make-server-1fcaa2e7/companies', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    if (profile.role !== 'admin') {
      return c.json({ error: 'Solo administradores pueden ver empresas' }, 403);
    }

    const allCompanies = await kv.getByPrefix('company:');
    return c.json({ companies: allCompanies });
  } catch (error) {
    console.log('Get companies error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get company workers stats
app.get('/make-server-1fcaa2e7/companies/:id/workers/stats', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const companyId = c.req.param('id');
    const profile = await kv.get(`user:${user.id}`);

    // Check if user is admin or company owner
    if (profile.role !== 'admin' && profile.companyId !== companyId) {
      return c.json({ error: 'No autorizado para ver estas estadísticas' }, 403);
    }

    // Get all users from this company
    const allUsers = await kv.getByPrefix('user:');
    const companyWorkers = allUsers.filter(u => u.companyId === companyId && u.role === 'worker');

    // Get enrollments and rankings for each worker
    const workersStats = await Promise.all(
      companyWorkers.map(async (worker) => {
        const allEnrollments = await kv.getByPrefix('enrollment:');
        const workerEnrollments = allEnrollments.filter(e => 
          e.id && e.id.startsWith('enrollment_') && e.userId === worker.id
        );

        const ranking = await kv.get(`ranking:${worker.id}`);

        return {
          id: worker.id,
          name: worker.name,
          email: worker.email,
          userCode: worker.userCode,
          points: worker.points || 0,
          completedCourses: worker.completedCourses || 0,
          enrolledCourses: workerEnrollments.length,
          rank: ranking?.rank || 0,
          monthlyPoints: ranking?.monthlyPoints || 0
        };
      })
    );

    return c.json({ workers: workersStats });
  } catch (error) {
    console.log('Get workers stats error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get individuals progress stats (Admin only)
app.get('/make-server-1fcaa2e7/individuals/stats', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    if (profile.role !== 'admin') {
      return c.json({ error: 'Solo administradores pueden ver estas estadísticas' }, 403);
    }

    // Get all individual users
    const allUsers = await kv.getByPrefix('user:');
    const individuals = allUsers.filter(u => u.role === 'individual');

    // Get enrollments and rankings for each individual
    const individualsStats = await Promise.all(
      individuals.map(async (individual) => {
        const allEnrollments = await kv.getByPrefix('enrollment:');
        const individualEnrollments = allEnrollments.filter(e => 
          e.id && e.id.startsWith('enrollment_') && e.userId === individual.id
        );

        // Get courses details for each enrollment
        const enrollmentsWithCourses = await Promise.all(
          individualEnrollments.map(async (enrollment) => {
            const course = await kv.get(`course:${enrollment.courseId}`);
            return { ...enrollment, course };
          })
        );

        const ranking = await kv.get(`ranking:${individual.id}`);

        return {
          id: individual.id,
          name: individual.name,
          email: individual.email,
          userCode: individual.userCode,
          points: individual.points || 0,
          completedCourses: individual.completedCourses || 0,
          enrolledCourses: individualEnrollments.length,
          enrollments: enrollmentsWithCourses,
          rank: ranking?.rank || 0,
          monthlyPoints: ranking?.monthlyPoints || 0
        };
      })
    );

    return c.json({ individuals: individualsStats });
  } catch (error) {
    console.log('Get individuals stats error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Assign worker to company
app.post('/make-server-1fcaa2e7/companies/:id/workers', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    if (profile.role !== 'admin') {
      return c.json({ error: 'Solo administradores pueden asignar trabajadores' }, 403);
    }

    const companyId = c.req.param('id');
    const { workerId } = await c.req.json();

    const worker = await kv.get(`user:${workerId}`);
    if (!worker) {
      return c.json({ error: 'Trabajador no encontrado' }, 404);
    }

    worker.companyId = companyId;
    await kv.set(`user:${workerId}`, worker);

    // Update company workers count
    const company = await kv.get(`company:${companyId}`);
    if (company) {
      company.workersCount = (company.workersCount || 0) + 1;
      await kv.set(`company:${companyId}`, company);
    }

    return c.json({ message: 'Trabajador asignado exitosamente' });
  } catch (error) {
    console.log('Assign worker error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// PURCHASE ROUTES
// ============================================

// Purchase package (Company)
app.post('/make-server-1fcaa2e7/purchases', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    if (profile.role !== 'company' && profile.role !== 'admin') {
      return c.json({ error: 'Solo empresas pueden comprar paquetes' }, 403);
    }

    const { packageId } = await c.req.json();
    const purchaseId = `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const pkg = await kv.get(`package:${packageId}`);
    if (!pkg) {
      return c.json({ error: 'Paquete no encontrado' }, 404);
    }

    const purchase = {
      id: purchaseId,
      userId: user.id,
      companyId: profile.companyId || user.id,
      packageId,
      purchasedAt: new Date().toISOString(),
      amount: pkg.price
    };

    await kv.set(`purchase:${purchaseId}`, purchase);

    return c.json({ purchase });
  } catch (error) {
    console.log('Purchase error:', error);
    return c.json({ error: error.message }, 500);
  }
});

Deno.serve(app.fetch);
