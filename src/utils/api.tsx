import { projectId, publicAnonKey } from './supabase/info';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-1fcaa2e7`;

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// Helper to get auth token
export const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || publicAnonKey;
};

// Helper for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getAuthToken();

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error en la solicitud');
  }

  return data;
};

// ============================================
// AUTH API
// ============================================

export const authAPI = {
  signup: async (email: string, password: string, name: string, role: string, companyId?: string) => {
    const response = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
      body: JSON.stringify({ email, password, name, role, companyId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Error al registrar usuario');
    }

    return data;
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },
};

// ============================================
// USER API
// ============================================

export const userAPI = {
  getCurrentUser: () => apiCall('/users/me'),
  updateProfile: (data: any) => apiCall('/users/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// ============================================
// USERS API (Admin)
// ============================================

export const usersAPI = {
  getAll: () => apiCall('/users'),
  update: (id: string, data: any) => apiCall(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiCall(`/users/${id}`, {
    method: 'DELETE',
  }),
};

// ============================================
// COURSES API
// ============================================

export const coursesAPI = {
  getAll: () => apiCall('/courses'),
  getAllCourses: () => apiCall('/courses'),
  getById: (id: string) => apiCall(`/courses/${id}`),
  create: (data: any) => apiCall('/courses', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  createCourse: (data: any) => apiCall('/courses', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiCall(`/courses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiCall(`/courses/${id}`, {
    method: 'DELETE',
  }),
};

// ============================================
// PACKAGES API
// ============================================

export const packagesAPI = {
  getAll: () => apiCall('/packages'),
  create: (data: any) => apiCall('/packages', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiCall(`/packages/${id}`, {
    method: 'DELETE',
  }),
};

// ============================================
// ENROLLMENTS API
// ============================================

export const enrollmentsAPI = {
  enroll: (courseId: string) => apiCall('/enrollments', {
    method: 'POST',
    body: JSON.stringify({ courseId }),
  }),
  getMyEnrollments: () => apiCall('/enrollments/my'),
  updateProgress: (enrollmentId: string, progress: number, currentModule: number, completed: boolean) =>
    apiCall(`/enrollments/${enrollmentId}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ progress, currentModule, completed }),
    }),
};

// ============================================
// RANKINGS API
// ============================================

export const rankingsAPI = {
  getAll: () => apiCall('/rankings'),
  getMonthly: () => apiCall('/rankings/monthly'),
};

// ============================================
// COMPANIES API
// ============================================

export const companiesAPI = {
  getAll: () => apiCall('/companies'),
  create: (data: any) => apiCall('/companies', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getWorkerStats: (companyId: string) => apiCall(`/companies/${companyId}/workers/stats`),
  assignWorker: (companyId: string, workerId: string) => apiCall(`/companies/${companyId}/workers`, {
    method: 'POST',
    body: JSON.stringify({ workerId }),
  }),
};

// ============================================
// INDIVIDUALS API
// ============================================

export const individualsAPI = {
  getStats: () => apiCall('/individuals/stats'),
};

// ============================================
// PURCHASES API
// ============================================

export const purchasesAPI = {
  create: (packageId: string) => apiCall('/purchases', {
    method: 'POST',
    body: JSON.stringify({ packageId }),
  }),
};
