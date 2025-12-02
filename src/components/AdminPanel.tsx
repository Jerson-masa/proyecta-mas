import { useState, useEffect } from 'react';
import { Plus, BookOpen, Package, Users, User, Building2, Edit, Trash2, Save, X, Sparkles, Check, BarChart3, TrendingUp, Award } from 'lucide-react';
import { coursesAPI, packagesAPI, companiesAPI, authAPI, usersAPI, individualsAPI } from '../utils/api';
import { RankingPanel } from './RankingPanel';
import { seedCourses } from './SeedData';

export function AdminPanel({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<'courses' | 'packages' | 'users' | 'ranking' | 'management'>('users');
  const [courses, setCourses] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [individuals, setIndividuals] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<'individual' | 'company' | 'worker' | null>(null);
  const [loading, setLoading] = useState(false);

  // Estados para gestión de empresas y progreso
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
  const [companyWorkers, setCompanyWorkers] = useState<any[]>([]);
  const [individualsProgress, setIndividualsProgress] = useState<any[]>([]);

  // User creation sub-tab
  const [userCreationType, setUserCreationType] = useState<'individual' | 'company' | 'worker'>('individual');

  // Forms para cada tipo de usuario
  const [individualForm, setIndividualForm] = useState({
    name: '',
    email: '',
    documentType: 'CC',
    documentNumber: '',
    password: '',
    confirmPassword: '',
    packageId: ''
  });

  const [companyForm, setCompanyForm] = useState({
    nit: '',
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    workerLimit: 10,
    packageId: ''
  });

  const [workerForm, setWorkerForm] = useState({
    name: '',
    documentNumber: '',
    email: '',
    phone: '',
    password: '',
    companyId: ''
  });

  // Course form
  const [courseForm, setCourseForm] = useState({
    name: '',
    description: '',
    category: '',
    thumbnailUrl: '',
    modules: [] as any[]
  });

  // Package form
  const [packageForm, setPackageForm] = useState({
    name: '',
    description: '',
    price: 0,
    workerLimit: 10,
    courseIds: [] as string[]
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'courses') {
        const data = await coursesAPI.getAllCourses();
        setCourses(data.courses || []);
      } else if (activeTab === 'packages') {
        const data = await packagesAPI.getAll();
        setPackages(data.packages || []);
      } else if (activeTab === 'users') {
        // Cargar todos los usuarios
        const userData = await usersAPI.getAll();
        setIndividuals(userData.individuals || []);
        setWorkers(userData.workers || []);
        setCompanies(userData.companies || []);

        // También cargar paquetes para los dropdowns
        const pkgData = await packagesAPI.getAll();
        setPackages(pkgData.packages || []);

        // Cargar empresas para el dropdown de trabajadores
        const compData = await companiesAPI.getAll();
        setCompanies(compData.companies || []);
      } else if (activeTab === 'management') {
        // Cargar todos los usuarios para gestión
        const userData = await usersAPI.getAll();
        setIndividuals(userData.individuals || []);
        setWorkers(userData.workers || []);
        setCompanies(userData.companies || []);

        // Cargar progreso de individuales por defecto
        const indData = await individualsAPI.getStats();
        setIndividualsProgress(indData.individuals || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = (pass1: string, pass2: string) => {
    return pass1 === pass2 && pass1.length >= 6;
  };

  const handleCreateIndividual = async () => {
    if (!passwordsMatch(individualForm.password, individualForm.confirmPassword)) {
      alert('Las contraseñas no coinciden o son muy cortas (mínimo 6 caracteres)');
      return;
    }
    if (!individualForm.packageId) {
      alert('Debe seleccionar un paquete');
      return;
    }

    try {
      await authAPI.signup(
        individualForm.email,
        individualForm.password,
        individualForm.name,
        'individual'
      );

      alert('✅ Usuario individual creado exitosamente');
      setIndividualForm({
        name: '',
        email: '',
        documentType: 'CC',
        documentNumber: '',
        password: '',
        confirmPassword: '',
        packageId: ''
      });
      setIsCreating(false);
      loadData();
    } catch (error: any) {
      alert('Error: ' + (error.message || 'No se pudo crear el usuario'));
    }
  };

  const handleCreateCompany = async () => {
    if (!passwordsMatch(companyForm.password, companyForm.confirmPassword)) {
      alert('Las contraseñas no coinciden o son muy cortas (mínimo 6 caracteres)');
      return;
    }
    if (!companyForm.packageId) {
      alert('Debe seleccionar un paquete');
      return;
    }

    try {
      // Crear usuario empresa
      await authAPI.signup(
        companyForm.email,
        companyForm.password,
        companyForm.companyName,
        'company'
      );

      // Guardar datos adicionales de la empresa
      await companiesAPI.create({
        nit: companyForm.nit,
        name: companyForm.companyName,
        email: companyForm.email,
        workerLimit: companyForm.workerLimit,
        packageId: companyForm.packageId
      });

      alert('✅ Empresa creada exitosamente');
      setCompanyForm({
        nit: '',
        companyName: '',
        email: '',
        password: '',
        confirmPassword: '',
        workerLimit: 10,
        packageId: ''
      });
      setIsCreating(false);
      loadData();
    } catch (error: any) {
      alert('Error: ' + (error.message || 'No se pudo crear la empresa'));
    }
  };

  const handleCreateWorker = async () => {
    if (!workerForm.companyId) {
      alert('Debe seleccionar una empresa');
      return;
    }

    try {
      // Usar contraseña manual o generar una temporal
      const password = workerForm.password || `worker${Math.random().toString(36).slice(2, 10)}`;

      await authAPI.signup(
        workerForm.email,
        password,
        workerForm.name,
        'worker',
        workerForm.companyId
      );

      if (workerForm.password) {
        alert('✅ Trabajador creado exitosamente');
      } else {
        const message = `✅ Trabajador creado exitosamente\n\nContraseña temporal: ${password}\n\n(Comparte esta contraseña con el trabajador)`;
        alert(message);
      }

      setWorkerForm({
        name: '',
        documentNumber: '',
        email: '',
        phone: '',
        password: '',
        companyId: ''
      });
      setIsCreating(false);
      loadData();
    } catch (error: any) {
      alert('Error: ' + (error.message || 'No se pudo crear el trabajador'));
    }
  };

  // Función para cargar progreso de trabajadores de una empresa
  const loadCompanyWorkers = async (companyId: string) => {
    try {
      const data = await companiesAPI.getWorkerStats(companyId);
      setCompanyWorkers(data.workers || []);
    } catch (error) {
      console.error('Error loading company workers:', error);
      setCompanyWorkers([]);
    }
  };

  // Función para cargar progreso de individuales
  const loadIndividualsProgress = async () => {
    try {
      const data = await individualsAPI.getStats();
      setIndividualsProgress(data.individuals || []);
    } catch (error) {
      console.error('Error loading individuals progress:', error);
      setIndividualsProgress([]);
    }
  };

  const handleCreateCourse = async () => {
    if (!courseForm.name || !courseForm.description || !courseForm.category) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      await coursesAPI.create({
        name: courseForm.name,
        description: courseForm.description,
        category: courseForm.category,
        thumbnailUrl: courseForm.thumbnailUrl,
        modules: courseForm.modules
      });

      alert('✅ Curso creado exitosamente');
      setCourseForm({
        name: '',
        description: '',
        category: '',
        thumbnailUrl: '',
        modules: []
      });
      setIsCreating(false);
      loadData();
      alert('✅ Curso creado exitosamente');
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Error al crear el curso');
    }
  };

  const handleCreatePackage = async () => {
    try {
      await packagesAPI.create(packageForm);
      setPackageForm({
        name: '',
        description: '',
        price: 0,
        workerLimit: 10,
        courseIds: []
      });
      setIsCreating(false);
      loadData();
      alert('✅ Paquete creado exitosamente');
    } catch (error) {
      console.error('Error creating package:', error);
      alert('Error al crear el paquete');
    }
  };

  const addModule = () => {
    setCourseForm({
      ...courseForm,
      modules: [
        ...courseForm.modules,
        {
          id: `module_${Date.now()}`,
          name: '',
          videos: []
        }
      ]
    });
  };

  const addVideoToModule = (moduleIndex: number) => {
    const newModules = [...courseForm.modules];
    if (!newModules[moduleIndex].videos) {
      newModules[moduleIndex].videos = [];
    }
    newModules[moduleIndex].videos.push({
      id: `video_${Date.now()}`,
      title: '',
      url: '',
      description: ''
    });
    setCourseForm({ ...courseForm, modules: newModules });
  };

  const startEditUser = (user: any, type: 'individual' | 'company' | 'worker') => {
    setEditingId(user.id);
    setEditingType(type);

    if (type === 'individual') {
      setIndividualForm({
        name: user.name || '',
        email: user.email || '',
        documentType: user.documentType || 'CC',
        documentNumber: user.documentNumber || '',
        password: '',
        confirmPassword: '',
        packageId: user.packageId || ''
      });
    } else if (type === 'company') {
      setCompanyForm({
        nit: user.nit || '',
        companyName: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
        workerLimit: user.workerLimit || 10,
        packageId: user.packageId || ''
      });
    } else if (type === 'worker') {
      setWorkerForm({
        name: user.name || '',
        documentNumber: user.documentNumber || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        companyId: user.companyId || ''
      });
    }
  };

  const handleUpdateUser = async () => {
    try {
      const cleanData = (data: any) => {
        const { password, confirmPassword, ...rest } = data;
        if (password && password.trim() !== '') {
          return { ...rest, password };
        }
        return rest;
      };

      if (editingType === 'individual') {
        await usersAPI.update(editingId!, {
          ...cleanData(individualForm),
          role: 'individual'
        });
        alert('✅ Usuario actualizado exitosamente');
      } else if (editingType === 'company') {
        await usersAPI.update(editingId!, {
          ...cleanData(companyForm),
          name: companyForm.companyName,
          role: 'company'
        });
        alert('✅ Empresa actualizada exitosamente');
      } else if (editingType === 'worker') {
        await usersAPI.update(editingId!, {
          ...cleanData(workerForm),
          role: 'worker'
        });
        alert('✅ Trabajador actualizado exitosamente');
      }

      cancelEdit();
      loadData();
    } catch (error: any) {
      alert('Error: ' + (error.message || 'No se pudo actualizar el usuario'));
    }
  };

  const handleDeleteUser = async (userId: string, type: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) {
      try {
        await usersAPI.delete(userId);
        alert('✅ Usuario eliminado exitosamente');
        loadData();
      } catch (error: any) {
        console.error('Error deleting user:', error);
        alert('Error: ' + (error.message || 'No se pudo eliminar el usuario'));
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingType(null);
    setIndividualForm({
      name: '',
      email: '',
      documentType: 'CC',
      documentNumber: '',
      password: '',
      confirmPassword: '',
      packageId: ''
    });
    setCompanyForm({
      nit: '',
      companyName: '',
      email: '',
      password: '',
      confirmPassword: '',
      workerLimit: 10,
      packageId: ''
    });
    setWorkerForm({
      name: '',
      documentNumber: '',
      email: '',
      phone: '',
      password: '',
      companyId: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0a0a2e] p-6 pb-20 shadow-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-white mb-1 font-bold text-2xl">Panel Administrador</h1>
              <p className="text-gray-300">Bienvenido, {user.name}</p>
            </div>
            <button
              onClick={onLogout}
              className="px-6 py-2 bg-white/10 backdrop-blur-sm rounded-[16px] text-white hover:bg-white/20 transition-all border border-white/20"
            >
              Salir
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto -mt-12 px-6">
        <div className="bg-white rounded-[24px] shadow-xl p-2 flex gap-2 mb-6 flex-wrap border border-gray-100">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 min-w-[120px] py-3 rounded-[16px] transition-all flex items-center justify-center gap-2 font-medium ${activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600'
              }`}
          >
            <Users className="w-5 h-5" />
            Usuarios
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex-1 min-w-[120px] py-3 rounded-[16px] transition-all flex items-center justify-center gap-2 font-medium ${activeTab === 'courses'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600'
              }`}
          >
            <BookOpen className="w-5 h-5" />
            Cursos
          </button>
          <button
            onClick={() => setActiveTab('packages')}
            className={`flex-1 min-w-[120px] py-3 rounded-[16px] transition-all flex items-center justify-center gap-2 font-medium ${activeTab === 'packages'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600'
              }`}
          >
            <Package className="w-5 h-5" />
            Paquetes
          </button>
          <button
            onClick={() => setActiveTab('ranking')}
            className={`flex-1 min-w-[120px] py-3 rounded-[16px] transition-all flex items-center justify-center gap-2 font-medium ${activeTab === 'ranking'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600'
              }`}
          >
            🏆 Ranking
          </button>
          <button
            onClick={() => setActiveTab('management')}
            className={`flex-1 min-w-[120px] py-3 rounded-[16px] transition-all flex items-center justify-center gap-2 font-medium ${activeTab === 'management'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600'
              }`}
          >
            <BarChart3 className="w-5 h-5" />
            Gestión
          </button>
        </div>

        {/* Content */}
        <div className="pb-8">
          {activeTab === 'ranking' && <RankingPanel />}

          {/* GESTIÓN Y PROGRESO */}
          {activeTab === 'management' && (
            <div>
              <h2 className="text-gray-900 mb-6 flex items-center gap-2 font-bold text-xl">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                Gestión y Progreso
              </h2>

              {/* Tabs para Empresas e Individuales */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                <button
                  onClick={() => {
                    setSelectedCompany(null);
                    loadIndividualsProgress();
                  }}
                  className={`px-4 py-2 rounded-[16px] transition-all whitespace-nowrap font-medium ${!selectedCompany
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                    }`}
                >
                  👤 Usuarios Individuales
                </button>
                {companies.map((company) => (
                  <button
                    key={company.id}
                    onClick={() => {
                      setSelectedCompany(company);
                      loadCompanyWorkers(company.id);
                    }}
                    className={`px-4 py-2 rounded-[16px] transition-all whitespace-nowrap font-medium ${selectedCompany?.id === company.id
                      ? 'bg-[#0a0a2e] text-white shadow-lg shadow-blue-900/30'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                      }`}
                  >
                    🏢 {company.name || company.companyName} {company.userCode && `(${company.userCode})`}
                  </button>
                ))}
              </div>

              {/* Vista de Individuales */}
              {!selectedCompany && (
                <div>
                  <div className="bg-white rounded-[24px] p-6 shadow-lg mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-gray-900 flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-600" />
                        Progreso de Usuarios Individuales ({individualsProgress.length})
                      </h3>
                      <button
                        onClick={loadIndividualsProgress}
                        className="px-4 py-2 bg-purple-100 text-purple-600 rounded-[16px] hover:bg-purple-200 transition-all"
                      >
                        Actualizar
                      </button>
                    </div>
                    <div className="space-y-3">
                      {individualsProgress.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No hay usuarios individuales registrados</p>
                      ) : (
                        individualsProgress.map((individual) => (
                          <div key={individual.id} className="bg-gray-50 rounded-[20px] p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-gray-900">{individual.name}</h4>
                                  {individual.userCode && (
                                    <span className="px-2 py-0.5 bg-purple-600 text-white rounded-[8px] text-xs font-mono">
                                      {individual.userCode}
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-600 text-sm">{individual.email}</p>
                              </div>
                              <div className="flex gap-3">
                                <div className="text-center">
                                  <div className="text-purple-600 font-mono">{individual.points}</div>
                                  <div className="text-xs text-gray-500">Puntos</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-green-600 font-mono">{individual.completedCourses}</div>
                                  <div className="text-xs text-gray-500">Completados</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-blue-600 font-mono">{individual.enrolledCourses}</div>
                                  <div className="text-xs text-gray-500">Inscritos</div>
                                </div>
                              </div>
                            </div>

                            {/* Cursos del individual */}
                            {individual.enrollments && individual.enrollments.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-gray-700 text-sm mb-2">Cursos inscritos:</p>
                                <div className="space-y-2">
                                  {individual.enrollments.map((enrollment: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between bg-white rounded-[12px] p-3">
                                      <div className="flex-1">
                                        <p className="text-gray-800 text-sm">{enrollment.course?.name || 'Curso sin nombre'}</p>
                                        <p className="text-gray-500 text-xs">{enrollment.course?.category || 'Sin categoría'}</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="text-right">
                                          <p className="text-sm text-gray-900">{enrollment.progress || 0}%</p>
                                          <p className="text-xs text-gray-500">Progreso</p>
                                        </div>
                                        {enrollment.completed && (
                                          <Check className="w-5 h-5 text-green-600" />
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Vista de Empresa Seleccionada */}
              {selectedCompany && (
                <div>
                  <div className="bg-white rounded-[24px] p-6 shadow-lg mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-gray-900 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-green-600" />
                            {selectedCompany.name || selectedCompany.companyName}
                          </h3>
                          {selectedCompany.userCode && (
                            <span className="px-2 py-0.5 bg-green-600 text-white rounded-[8px] text-xs font-mono">
                              {selectedCompany.userCode}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">
                          NIT: {selectedCompany.nit} • Trabajadores: {companyWorkers.length}
                        </p>
                      </div>
                      <button
                        onClick={() => loadCompanyWorkers(selectedCompany.id)}
                        className="px-4 py-2 bg-green-100 text-green-600 rounded-[16px] hover:bg-green-200 transition-all"
                      >
                        Actualizar
                      </button>
                    </div>

                    {/* Estadísticas generales de la empresa */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      <div className="bg-white rounded-[16px] p-4 text-center border-2 border-green-100 shadow-sm">
                        <div className="text-2xl text-green-600 mb-1 font-bold">{companyWorkers.length}</div>
                        <div className="text-sm text-gray-500">Trabajadores</div>
                      </div>
                      <div className="bg-white rounded-[16px] p-4 text-center border-2 border-blue-100 shadow-sm">
                        <div className="text-2xl text-blue-600 mb-1 font-bold">
                          {companyWorkers.reduce((sum, w) => sum + (w.enrolledCourses || 0), 0)}
                        </div>
                        <div className="text-sm text-gray-500">Total Inscritos</div>
                      </div>
                      <div className="bg-white rounded-[16px] p-4 text-center border-2 border-purple-100 shadow-sm">
                        <div className="text-2xl text-purple-600 mb-1 font-bold">
                          {companyWorkers.reduce((sum, w) => sum + (w.completedCourses || 0), 0)}
                        </div>
                        <div className="text-sm text-gray-500">Total Completados</div>
                      </div>
                      <div className="bg-white rounded-[16px] p-4 text-center border-2 border-yellow-100 shadow-sm">
                        <div className="text-2xl text-yellow-600 mb-1 font-bold">
                          {companyWorkers.reduce((sum, w) => sum + (w.points || 0), 0)}
                        </div>
                        <div className="text-sm text-gray-500">Total Puntos</div>
                      </div>
                    </div>

                    {/* Lista de trabajadores */}
                    <div className="space-y-3">
                      {companyWorkers.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Esta empresa no tiene trabajadores asignados</p>
                      ) : (
                        companyWorkers.map((worker) => (
                          <div key={worker.id} className="bg-gray-50 rounded-[20px] p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-gray-900">{worker.name}</h4>
                                  {worker.userCode && (
                                    <span className="px-2 py-0.5 bg-blue-600 text-white rounded-[8px] text-xs font-mono">
                                      {worker.userCode || `${selectedCompany.userCode}-T${companyWorkers.indexOf(worker) + 1}`}
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-600 text-sm">{worker.email}</p>
                              </div>
                              <div className="flex gap-3">
                                <div className="text-center">
                                  <div className="text-purple-600 font-mono">{worker.points}</div>
                                  <div className="text-xs text-gray-500">Puntos</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-green-600 font-mono">{worker.completedCourses}</div>
                                  <div className="text-xs text-gray-500">Completados</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-blue-600 font-mono">{worker.enrolledCourses}</div>
                                  <div className="text-xs text-gray-500">Inscritos</div>
                                </div>
                                {worker.rank > 0 && (
                                  <div className="text-center">
                                    <div className="text-yellow-600 font-mono">#{worker.rank}</div>
                                    <div className="text-xs text-gray-500">Ranking</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* GESTIÓN DE USUARIOS */}
          {activeTab === 'users' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-gray-900">Gestión de Usuarios</h2>
                {!editingId && (
                  <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-[16px] hover:bg-blue-700 hover:shadow-lg transition-all flex items-center gap-2 font-bold"
                  >
                    <Plus className="w-5 h-5" />
                    Crear Usuario
                  </button>
                )}
              </div>

              {/* Modal de Creación */}
              {isCreating && (
                <div className="bg-white rounded-[24px] p-6 shadow-lg mb-6 border-2 border-blue-200">
                  <h3 className="text-gray-900 mb-4 flex items-center gap-2 font-bold">
                    <Plus className="w-5 h-5 text-blue-600" />
                    Crear Nuevo Usuario
                  </h3>

                  {/* Selector de Tipo de Usuario */}
                  <div className="flex gap-2 mb-6">
                    <button
                      onClick={() => setUserCreationType('individual')}
                      className={`flex-1 py-2 rounded-[12px] text-sm font-medium transition-all ${userCreationType === 'individual'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      Individual
                    </button>
                    <button
                      onClick={() => setUserCreationType('company')}
                      className={`flex-1 py-2 rounded-[12px] text-sm font-medium transition-all ${userCreationType === 'company'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      Empresa
                    </button>
                    <button
                      onClick={() => setUserCreationType('worker')}
                      className={`flex-1 py-2 rounded-[12px] text-sm font-medium transition-all ${userCreationType === 'worker'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      Trabajador
                    </button>
                  </div>

                  {/* Formulario Individual */}
                  {userCreationType === 'individual' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 mb-2">Nombre Completo *</label>
                        <input
                          type="text"
                          value={individualForm.name}
                          onChange={(e) => setIndividualForm({ ...individualForm, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">Correo Electrónico *</label>
                        <input
                          type="email"
                          value={individualForm.email}
                          onChange={(e) => setIndividualForm({ ...individualForm, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 mb-2">Contraseña *</label>
                          <input
                            type="password"
                            value={individualForm.password}
                            onChange={(e) => setIndividualForm({ ...individualForm, password: e.target.value })}
                            className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-2">Confirmar Contraseña *</label>
                          <input
                            type="password"
                            value={individualForm.confirmPassword}
                            onChange={(e) => setIndividualForm({ ...individualForm, confirmPassword: e.target.value })}
                            className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 mb-2">Tipo de Documento</label>
                          <select
                            value={individualForm.documentType}
                            onChange={(e) => setIndividualForm({ ...individualForm, documentType: e.target.value })}
                            className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none bg-white"
                          >
                            <option value="CC">Cédula de Ciudadanía</option>
                            <option value="TI">Tarjeta de Identidad</option>
                            <option value="CE">Cédula de Extranjería</option>
                            <option value="PAS">Pasaporte</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-2">Número de Documento</label>
                          <input
                            type="text"
                            value={individualForm.documentNumber}
                            onChange={(e) => setIndividualForm({ ...individualForm, documentNumber: e.target.value })}
                            className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">Paquete</label>
                        <select
                          value={individualForm.packageId}
                          onChange={(e) => setIndividualForm({ ...individualForm, packageId: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-indigo-600 focus:border-blue-600 focus:outline-none bg-white"
                        >
                          <option value="">Seleccionar paquete...</option>
                          {packages.map((pkg) => (
                            <option key={pkg.id} value={pkg.id}>
                              {pkg.name} - ${pkg.price}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={handleCreateIndividual}
                          className="flex-1 py-3 bg-blue-600 text-white rounded-[16px] hover:bg-blue-700 hover:shadow-lg transition-all font-bold"
                        >
                          Crear Individual
                        </button>
                        <button
                          onClick={() => setIsCreating(false)}
                          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-[16px] hover:bg-gray-300 transition-all font-medium"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Formulario Empresa */}
                  {userCreationType === 'company' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 mb-2">NIT *</label>
                        <input
                          type="text"
                          value={companyForm.nit}
                          onChange={(e) => setCompanyForm({ ...companyForm, nit: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">Nombre de la Empresa *</label>
                        <input
                          type="text"
                          value={companyForm.companyName}
                          onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">Correo Electrónico *</label>
                        <input
                          type="email"
                          value={companyForm.email}
                          onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 mb-2">Contraseña *</label>
                          <input
                            type="password"
                            value={companyForm.password}
                            onChange={(e) => setCompanyForm({ ...companyForm, password: e.target.value })}
                            className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-2">Confirmar Contraseña *</label>
                          <input
                            type="password"
                            value={companyForm.confirmPassword}
                            onChange={(e) => setCompanyForm({ ...companyForm, confirmPassword: e.target.value })}
                            className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">Cantidad de Trabajadores</label>
                        <input
                          type="number"
                          value={companyForm.workerLimit}
                          onChange={(e) => setCompanyForm({ ...companyForm, workerLimit: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">Paquete</label>
                        <select
                          value={companyForm.packageId}
                          onChange={(e) => setCompanyForm({ ...companyForm, packageId: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-indigo-600 focus:border-blue-600 focus:outline-none bg-white"
                        >
                          <option value="">Seleccionar paquete...</option>
                          {packages.map((pkg) => (
                            <option key={pkg.id} value={pkg.id}>
                              {pkg.name} - ${pkg.price}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={handleCreateCompany}
                          className="flex-1 py-3 bg-blue-600 text-white rounded-[16px] hover:bg-blue-700 hover:shadow-lg transition-all font-bold"
                        >
                          Crear Empresa
                        </button>
                        <button
                          onClick={() => setIsCreating(false)}
                          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-[16px] hover:bg-gray-300 transition-all font-medium"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Formulario Trabajador */}
                  {userCreationType === 'worker' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 mb-2">Nombre Completo *</label>
                        <input
                          type="text"
                          value={workerForm.name}
                          onChange={(e) => setWorkerForm({ ...workerForm, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">Cédula *</label>
                        <input
                          type="text"
                          value={workerForm.documentNumber}
                          onChange={(e) => setWorkerForm({ ...workerForm, documentNumber: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">Correo Electrónico *</label>
                        <input
                          type="email"
                          value={workerForm.email}
                          onChange={(e) => setWorkerForm({ ...workerForm, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">Teléfono *</label>
                        <input
                          type="tel"
                          value={workerForm.phone}
                          onChange={(e) => setWorkerForm({ ...workerForm, phone: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">Empresa *</label>
                        <select
                          value={workerForm.companyId}
                          onChange={(e) => setWorkerForm({ ...workerForm, companyId: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-indigo-600 focus:border-blue-600 focus:outline-none bg-white"
                        >
                          <option value="">Seleccionar empresa...</option>
                          {companies.map((company) => (
                            <option key={company.id} value={company.id}>
                              {company.name} - NIT: {company.nit}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">Contraseña (Opcional)</label>
                        <input
                          type="password"
                          value={workerForm.password}
                          onChange={(e) => setWorkerForm({ ...workerForm, password: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                          placeholder="Dejar en blanco para autogenerar"
                        />
                      </div>
                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={handleCreateWorker}
                          className="flex-1 py-3 bg-blue-600 text-white rounded-[16px] hover:bg-blue-700 hover:shadow-lg transition-all font-bold"
                        >
                          Crear Trabajador
                        </button>
                        <button
                          onClick={() => setIsCreating(false)}
                          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-[16px] hover:bg-gray-300 transition-all font-medium"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Modal de Edición */}
              {editingId && (
                <div className="bg-white rounded-[24px] p-6 shadow-lg mb-6 border-2 border-orange-200">
                  <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                    <Edit className="w-5 h-5 text-orange-600" />
                    Editar {editingType === 'individual' ? 'Individual' : editingType === 'company' ? 'Empresa' : 'Trabajador'}
                  </h3>

                  {editingType === 'individual' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 mb-2">Nombre Completo *</label>
                        <input
                          type="text"
                          value={individualForm.name}
                          onChange={(e) => setIndividualForm({ ...individualForm, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">Correo Electrónico *</label>
                        <input
                          type="email"
                          value={individualForm.email}
                          onChange={(e) => setIndividualForm({ ...individualForm, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">Nueva Contraseña (Opcional)</label>
                        <input
                          type="password"
                          value={individualForm.password}
                          onChange={(e) => setIndividualForm({ ...individualForm, password: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                          placeholder="Dejar en blanco para mantener la actual"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 mb-2">Tipo de Documento</label>
                          <select
                            value={individualForm.documentType}
                            onChange={(e) => setIndividualForm({ ...individualForm, documentType: e.target.value })}
                            className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none bg-white"
                          >
                            <option value="CC">Cédula de Ciudadanía</option>
                            <option value="TI">Tarjeta de Identidad</option>
                            <option value="CE">Cédula de Extranjería</option>
                            <option value="PAS">Pasaporte</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-2">Número de Documento</label>
                          <input
                            type="text"
                            value={individualForm.documentNumber}
                            onChange={(e) => setIndividualForm({ ...individualForm, documentNumber: e.target.value })}
                            className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">Paquete</label>
                        <select
                          value={individualForm.packageId}
                          onChange={(e) => setIndividualForm({ ...individualForm, packageId: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-indigo-600 focus:border-blue-600 focus:outline-none bg-white"
                        >
                          <option value="">Seleccionar paquete...</option>
                          {packages.map((pkg) => (
                            <option key={pkg.id} value={pkg.id}>
                              {pkg.name} - ${pkg.price}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={handleUpdateUser}
                          className="flex-1 py-3 bg-blue-600 text-white rounded-[16px] hover:bg-blue-700 hover:shadow-lg transition-all font-bold"
                        >
                          Guardar Cambios
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-[16px] hover:bg-gray-300 transition-all font-medium"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {editingType === 'company' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 mb-2">NIT *</label>
                        <input
                          type="text"
                          value={companyForm.nit}
                          onChange={(e) => setCompanyForm({ ...companyForm, nit: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">Nombre de la Empresa *</label>
                        <input
                          type="text"
                          value={companyForm.companyName}
                          onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">Correo Electrónico *</label>
                        <input
                          type="email"
                          value={companyForm.email}
                          onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">Nueva Contraseña (Opcional)</label>
                        <input
                          type="password"
                          value={companyForm.password}
                          onChange={(e) => setCompanyForm({ ...companyForm, password: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                          placeholder="Dejar en blanco para mantener la actual"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">Cantidad de Trabajadores</label>
                        <input
                          type="number"
                          value={companyForm.workerLimit}
                          onChange={(e) => setCompanyForm({ ...companyForm, workerLimit: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                          min="1"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">Paquete</label>
                        <select
                          value={companyForm.packageId}
                          onChange={(e) => setCompanyForm({ ...companyForm, packageId: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-indigo-600 focus:border-blue-600 focus:outline-none bg-white"
                        >
                          <option value="">Seleccionar paquete...</option>
                          {packages.map((pkg) => (
                            <option key={pkg.id} value={pkg.id}>
                              {pkg.name} - ${pkg.price}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={handleUpdateUser}
                          className="flex-1 py-3 bg-blue-600 text-white rounded-[16px] hover:bg-blue-700 hover:shadow-lg transition-all font-bold"
                        >
                          Guardar Cambios
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-[16px] hover:bg-gray-300 transition-all font-medium"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {editingType === 'worker' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 mb-2">Nombre Completo *</label>
                        <input
                          type="text"
                          value={workerForm.name}
                          onChange={(e) => setWorkerForm({ ...workerForm, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">Cédula *</label>
                        <input
                          type="text"
                          value={workerForm.documentNumber}
                          onChange={(e) => setWorkerForm({ ...workerForm, documentNumber: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">Correo Electrónico *</label>
                        <input
                          type="email"
                          value={workerForm.email}
                          onChange={(e) => setWorkerForm({ ...workerForm, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">Teléfono *</label>
                        <input
                          type="tel"
                          value={workerForm.phone}
                          onChange={(e) => setWorkerForm({ ...workerForm, phone: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">Nueva Contraseña (Opcional)</label>
                        <input
                          type="password"
                          value={workerForm.password}
                          onChange={(e) => setWorkerForm({ ...workerForm, password: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                          placeholder="Dejar en blanco para mantener la actual"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">Empresa *</label>
                        <select
                          value={workerForm.companyId}
                          onChange={(e) => setWorkerForm({ ...workerForm, companyId: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-indigo-600 focus:border-blue-600 focus:outline-none bg-white"
                        >
                          <option value="">Seleccionar empresa...</option>
                          {companies.map((company) => (
                            <option key={company.id} value={company.id}>
                              {company.name} - NIT: {company.nit}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={handleUpdateUser}
                          className="flex-1 py-3 bg-blue-600 text-white rounded-[16px] hover:bg-blue-700 hover:shadow-lg transition-all font-bold"
                        >
                          Guardar Cambios
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-[16px] hover:bg-gray-300 transition-all font-medium"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Lista de Usuarios */}
              <div className="space-y-6">
                {/* Individuales */}
                <div>
                  <h3 className="text-gray-900 mb-3 flex items-center gap-2 font-bold">
                    <Users className="w-5 h-5 text-blue-600" />
                    Usuarios Individuales ({individuals.length})
                  </h3>
                  <div className="grid gap-3">
                    {individuals.map((individual) => (
                      <div key={individual.id} className="bg-white rounded-[20px] p-5 shadow-md border border-gray-100">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-gray-900 font-medium">{individual.name}</h4>
                              {individual.userCode && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-[8px] text-xs font-mono">
                                  {individual.userCode}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-500 mb-2 text-sm">{individual.email}</p>
                            <div className="flex gap-2 flex-wrap">
                              <span className="px-3 py-1 bg-purple-100 text-purple-600 border border-purple-200 rounded-[12px] text-xs">
                                Individual
                              </span>
                              {individual.documentNumber && (
                                <span className="px-3 py-1 bg-gray-100 text-gray-600 border border-gray-200 rounded-[12px] text-xs">
                                  Doc: {individual.documentNumber}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditUser(individual, 'individual')}
                              className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-[12px] transition-all"
                              title="Editar usuario"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(individual.id, 'individual')}
                              className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-[12px] transition-all"
                              title="Eliminar usuario"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Empresas */}
                <div>
                  <h3 className="text-gray-900 mb-3 flex items-center gap-2 font-bold">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    Empresas ({companies.length})
                  </h3>
                  <div className="grid gap-3">
                    {companies.map((company) => (
                      <div key={company.id} className="bg-white rounded-[20px] p-5 shadow-md border border-gray-100">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-gray-900 font-medium">{company.name}</h4>
                              {company.userCode && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-[8px] text-xs font-mono">
                                  {company.userCode}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-500 mb-2 text-sm">{company.email}</p>
                            <div className="flex gap-2 flex-wrap">
                              <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-[12px] text-xs">
                                Empresa
                              </span>
                              <span className="px-3 py-1 bg-gray-100 text-gray-600 border border-gray-200 rounded-[12px] text-xs">
                                NIT: {company.nit}
                              </span>
                              <span className="px-3 py-1 bg-gray-100 text-gray-600 border border-gray-200 rounded-[12px] text-xs">
                                Trabajadores: {company.workerLimit}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditUser(company, 'company')}
                              className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-[12px] transition-all"
                              title="Editar empresa"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(company.id, 'company')}
                              className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-[12px] transition-all"
                              title="Eliminar empresa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trabajadores */}
                <div>
                  <h3 className="text-gray-900 mb-3 flex items-center gap-2 font-bold">
                    <Users className="w-5 h-5 text-blue-600" />
                    Trabajadores ({workers.length})
                  </h3>
                  <div className="grid gap-3">
                    {workers.map((worker) => (
                      <div key={worker.id} className="bg-white rounded-[20px] p-5 shadow-md border border-gray-100">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-gray-900 font-medium">{worker.name}</h4>
                              {worker.userCode && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-[8px] text-xs font-mono">
                                  {worker.userCode}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-500 mb-2 text-sm">{worker.email}</p>
                            <div className="flex gap-2 flex-wrap">
                              <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-[12px] text-xs">
                                Trabajador
                              </span>
                              {worker.documentNumber && (
                                <span className="px-3 py-1 bg-gray-100 text-gray-600 border border-gray-200 rounded-[12px] text-xs">
                                  Cédula: {worker.documentNumber}
                                </span>
                              )}
                              {worker.phone && (
                                <span className="px-3 py-1 bg-gray-100 text-gray-600 border border-gray-200 rounded-[12px] text-xs">
                                  Tel: {worker.phone}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditUser(worker, 'worker')}
                              className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-[12px] transition-all"
                              title="Editar trabajador"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(worker.id, 'worker')}
                              className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-[12px] transition-all"
                              title="Eliminar trabajador"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GESTIÓN DE CURSOS */}
          {activeTab === 'courses' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-gray-900 font-bold text-xl">Gestión de Cursos</h2>
                <div className="flex gap-2">
                  {courses.length === 0 && (
                    <button
                      onClick={async () => {
                        if (confirm('¿Quieres generar cursos de prueba con datos reales?')) {
                          try {
                            await seedCourses();
                            alert('✅ Cursos de prueba creados exitosamente');
                            loadData();
                          } catch (error) {
                            alert('Error al crear cursos de prueba');
                          }
                        }
                      }}
                      className="px-6 py-3 bg-gray-800 text-white rounded-[16px] hover:bg-gray-900 hover:shadow-lg transition-all flex items-center gap-2 font-medium"
                    >
                      <Sparkles className="w-5 h-5" />
                      Generar Datos de Prueba
                    </button>
                  )}
                  {!editingId && (
                    <button
                      onClick={() => setIsCreating(!isCreating)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-[16px] hover:bg-blue-700 hover:shadow-lg transition-all flex items-center gap-2 font-bold"
                    >
                      <Plus className="w-5 h-5" />
                      Crear Curso
                    </button>
                  )}
                </div>
              </div>

              {/* Formulario de Creación/Edición de Curso */}
              {(isCreating || editingId) && (
                <div className="bg-white rounded-[24px] p-6 shadow-lg mb-6 border-2 border-blue-100">
                  <h3 className="text-gray-900 mb-4 flex items-center gap-2 font-bold">
                    {editingId ? (
                      <>
                        <Edit className="w-5 h-5 text-blue-600" />
                        Editar Curso
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 text-blue-600" />
                        Crear Nuevo Curso
                      </>
                    )}
                  </h3>

                  <div className="space-y-4">
                    {/* Información básica del curso */}
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">Nombre del Curso *</label>
                      <input
                        type="text"
                        value={courseForm.name}
                        onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                        placeholder="Ej: Introducción a React"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">Descripción *</label>
                      <textarea
                        value={courseForm.description}
                        onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                        className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                        rows={3}
                        placeholder="Describe de qué trata el curso..."
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">Categoría *</label>
                      <select
                        value={courseForm.category}
                        onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                        className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none bg-white"
                      >
                        <option value="">Seleccionar categoría...</option>
                        <option value="Programación">Programación</option>
                        <option value="Diseño">Diseño</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Negocios">Negocios</option>
                        <option value="Idiomas">Idiomas</option>
                        <option value="Desarrollo Personal">Desarrollo Personal</option>
                        <option value="Tecnología">Tecnología</option>
                        <option value="Salud">Salud</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">Miniatura del Curso (URL)</label>
                      <input
                        type="url"
                        value={courseForm.thumbnailUrl}
                        onChange={(e) => setCourseForm({ ...courseForm, thumbnailUrl: e.target.value })}
                        className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                      <p className="text-gray-500 text-sm mt-1">
                        🖼️ URL de la imagen que se mostrará como miniatura del curso
                      </p>
                      {courseForm.thumbnailUrl && (
                        <div className="mt-3 rounded-[16px] overflow-hidden border-2 border-gray-200">
                          <img
                            src={courseForm.thumbnailUrl}
                            alt="Vista previa"
                            className="w-full h-48 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '';
                              (e.target as HTMLImageElement).alt = '❌ Error al cargar la imagen';
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Módulos */}
                    <div className="border-t-2 border-gray-200 pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-gray-900 font-medium">Módulos del Curso</h4>
                        <button
                          onClick={addModule}
                          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-[12px] hover:bg-blue-100 transition-all flex items-center gap-2 font-medium"
                        >
                          <Plus className="w-4 h-4" />
                          Agregar Módulo
                        </button>
                      </div>

                      {courseForm.modules.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-[16px]">
                          <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p className="text-gray-500">No hay módulos. Agrega el primer módulo.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {courseForm.modules.map((module, moduleIndex) => (
                            <div key={module.id} className="bg-gray-50 rounded-[16px] p-4 border-2 border-gray-200">
                              <div className="flex items-center justify-between mb-3">
                                <h5 className="text-gray-700 font-medium">Módulo {moduleIndex + 1}</h5>
                                <button
                                  onClick={() => {
                                    const newModules = courseForm.modules.filter((_, i) => i !== moduleIndex);
                                    setCourseForm({ ...courseForm, modules: newModules });
                                  }}
                                  className="p-2 hover:bg-red-50 rounded-[8px] transition-all"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                              </div>

                              <div className="space-y-3">
                                <div>
                                  <label className="block text-gray-600 mb-1 text-sm">Nombre del Módulo *</label>
                                  <input
                                    type="text"
                                    value={module.name}
                                    onChange={(e) => {
                                      const newModules = [...courseForm.modules];
                                      newModules[moduleIndex].name = e.target.value;
                                      setCourseForm({ ...courseForm, modules: newModules });
                                    }}
                                    className="w-full px-3 py-2 rounded-[12px] border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                                    placeholder="Ej: Fundamentos de React"
                                  />
                                </div>

                                {/* Videos del módulo */}
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <label className="text-gray-600 text-sm">Videos</label>
                                    <button
                                      onClick={() => addVideoToModule(moduleIndex)}
                                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded-[8px] hover:bg-blue-100 transition-all text-sm flex items-center gap-1"
                                    >
                                      <Plus className="w-3 h-3" />
                                      Video
                                    </button>
                                  </div>

                                  {!module.videos || module.videos.length === 0 ? (
                                    <div className="text-center py-4 bg-white rounded-[12px] border border-gray-200">
                                      <p className="text-gray-400 text-sm">Sin videos</p>
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      {module.videos.map((video, videoIndex) => (
                                        <div key={video.id} className="bg-white rounded-[12px] p-3 border border-gray-200">
                                          <div className="flex items-center justify-between mb-2">
                                            <span className="text-gray-600 text-sm">Video {videoIndex + 1}</span>
                                            <button
                                              onClick={() => {
                                                const newModules = [...courseForm.modules];
                                                newModules[moduleIndex].videos = newModules[moduleIndex].videos.filter((_, i) => i !== videoIndex);
                                                setCourseForm({ ...courseForm, modules: newModules });
                                              }}
                                              className="p-1 hover:bg-red-50 rounded-[6px]"
                                            >
                                              <X className="w-3 h-3 text-red-600" />
                                            </button>
                                          </div>

                                          <div className="space-y-2">
                                            <input
                                              type="text"
                                              value={video.title}
                                              onChange={(e) => {
                                                const newModules = [...courseForm.modules];
                                                newModules[moduleIndex].videos[videoIndex].title = e.target.value;
                                                setCourseForm({ ...courseForm, modules: newModules });
                                              }}
                                              className="w-full px-3 py-2 rounded-[8px] border border-gray-200 focus:border-blue-600 focus:outline-none text-sm"
                                              placeholder="Título del video"
                                            />
                                            <input
                                              type="text"
                                              value={video.url}
                                              onChange={(e) => {
                                                const newModules = [...courseForm.modules];
                                                newModules[moduleIndex].videos[videoIndex].url = e.target.value;
                                                setCourseForm({ ...courseForm, modules: newModules });
                                              }}
                                              className="w-full px-3 py-2 rounded-[8px] border border-gray-200 focus:border-blue-600 focus:outline-none text-sm"
                                              placeholder="URL del video (YouTube, Vimeo, etc.)"
                                            />
                                            <textarea
                                              value={video.description}
                                              onChange={(e) => {
                                                const newModules = [...courseForm.modules];
                                                newModules[moduleIndex].videos[videoIndex].description = e.target.value;
                                                setCourseForm({ ...courseForm, modules: newModules });
                                              }}
                                              className="w-full px-3 py-2 rounded-[8px] border border-gray-200 focus:border-blue-600 focus:outline-none text-sm"
                                              rows={2}
                                              placeholder="Descripción del video"
                                            />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                      <button
                        onClick={editingId ? () => {
                          coursesAPI.update(editingId, courseForm).then(() => {
                            alert('✅ Curso actualizado exitosamente');
                            setEditingId(null);
                            setCourseForm({
                              name: '',
                              description: '',
                              category: '',
                              thumbnailUrl: '',
                              modules: []
                            });
                            loadData();
                          }).catch((error) => {
                            alert('Error: ' + error.message);
                          });
                        } : handleCreateCourse}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-[16px] hover:bg-blue-700 hover:shadow-lg transition-all font-bold"
                      >
                        {editingId ? 'Guardar Cambios' : 'Crear Curso'}
                      </button>
                      <button
                        onClick={() => {
                          setIsCreating(false);
                          setEditingId(null);
                          setCourseForm({
                            name: '',
                            description: '',
                            category: '',
                            thumbnailUrl: '',
                            modules: []
                          });
                        }}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-[16px] hover:bg-gray-300 transition-all font-medium"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de Cursos */}
              <div className="space-y-4">
                <h3 className="text-gray-900 mb-3 flex items-center gap-2 font-bold">
                  📚 Cursos Creados ({courses.length})
                </h3>

                {courses.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-[24px]">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No hay cursos creados</p>
                    <p className="text-gray-400 text-sm mt-2">Crea tu primer curso para comenzar</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {courses.map((course) => (
                      <div key={course.id} className="bg-[#0a0a2e] rounded-[20px] p-6 shadow-md border border-blue-900/50">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="text-white mb-2 font-bold text-lg">{course.name}</h4>
                            <p className="text-gray-400 mb-3">{course.description}</p>
                            <div className="flex gap-2 flex-wrap">
                              <span className="px-3 py-1 bg-blue-900/50 text-blue-200 border border-blue-800 rounded-[12px] text-sm">
                                {course.category}
                              </span>
                              <span className="px-3 py-1 bg-blue-900/50 text-gray-300 border border-blue-800 rounded-[12px] text-sm">
                                {course.modules?.length || 0} módulos
                              </span>
                              <span className="px-3 py-1 bg-blue-900/50 text-gray-300 border border-blue-800 rounded-[12px] text-sm">
                                {course.modules?.reduce((total, mod) => total + (mod.videos?.length || 0), 0) || 0} videos
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingId(course.id);
                                setCourseForm({
                                  name: course.name,
                                  description: course.description,
                                  category: course.category,
                                  thumbnailUrl: course.thumbnailUrl || '',
                                  modules: course.modules || []
                                });
                              }}
                              className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-[12px] transition-all"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm('¿Estás seguro de eliminar este curso?')) {
                                  try {
                                    await coursesAPI.delete(course.id);
                                    alert('✅ Curso eliminado exitosamente');
                                    loadData();
                                  } catch (error) {
                                    alert('Error al eliminar el curso');
                                  }
                                }
                              }}
                              className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-[12px] transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Vista previa de módulos */}
                        {course.modules && course.modules.length > 0 && (
                          <div className="border-t border-blue-900/50 pt-4 mt-4">
                            <p className="text-gray-400 text-sm mb-2">Módulos:</p>
                            <div className="space-y-2">
                              {course.modules.map((module, idx) => (
                                <div key={idx} className="bg-blue-950/30 rounded-[12px] p-3 border border-blue-900/30">
                                  <p className="text-gray-300 text-sm mb-1">{idx + 1}. {module.name}</p>
                                  <p className="text-gray-500 text-xs">
                                    {module.videos?.length || 0} video{module.videos?.length !== 1 ? 's' : ''}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* GESTIÓN DE PAQUETES */}
          {activeTab === 'packages' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-gray-900">Gestión de Paquetes</h2>
                <button
                  onClick={() => setIsCreating(!isCreating)}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[16px] hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Crear Paquete
                </button>
              </div>

              {/* Formulario de Creación de Paquete */}
              {isCreating && (
                <div className="bg-white rounded-[24px] p-6 shadow-lg mb-6 border-2 border-indigo-200">
                  <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-indigo-600" />
                    Crear Nuevo Paquete
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 mb-2">Nombre del Paquete *</label>
                      <input
                        type="text"
                        value={packageForm.name}
                        onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-indigo-600 focus:outline-none"
                        placeholder="Ej: Paquete Básico"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">Descripción *</label>
                      <textarea
                        value={packageForm.description}
                        onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                        className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-indigo-600 focus:outline-none"
                        rows={3}
                        placeholder="Describe qué incluye este paquete..."
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">Precio (USD) *</label>
                      <input
                        type="number"
                        value={packageForm.price}
                        onChange={(e) => setPackageForm({ ...packageForm, price: parseFloat(e.target.value) })}
                        className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-indigo-600 focus:outline-none"
                        placeholder="99.99"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">Límite de Trabajadores</label>
                      <input
                        type="number"
                        value={packageForm.workerLimit}
                        onChange={(e) => setPackageForm({ ...packageForm, workerLimit: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-indigo-600 focus:outline-none"
                        placeholder="Ej: 10"
                        min="1"
                      />
                      <p className="text-gray-500 text-sm mt-1">
                        👥 Cantidad máxima de trabajadores que pueden ser registrados con este paquete
                      </p>
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">Cursos Incluidos *</label>
                      <div className="bg-gray-50 rounded-[16px] p-4 border-2 border-gray-200 max-h-64 overflow-y-auto">
                        {courses.length === 0 ? (
                          <p className="text-gray-500 text-center py-4">
                            No hay cursos disponibles. Crea cursos primero.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {courses.map((course) => (
                              <label
                                key={course.id}
                                className="flex items-center gap-3 p-3 bg-white rounded-[12px] hover:bg-indigo-50 cursor-pointer transition-all"
                              >
                                <input
                                  type="checkbox"
                                  checked={packageForm.courseIds.includes(course.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setPackageForm({
                                        ...packageForm,
                                        courseIds: [...packageForm.courseIds, course.id]
                                      });
                                    } else {
                                      setPackageForm({
                                        ...packageForm,
                                        courseIds: packageForm.courseIds.filter(id => id !== course.id)
                                      });
                                    }
                                  }}
                                  className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <div className="flex-1">
                                  <p className="text-gray-900">{course.name}</p>
                                  <p className="text-gray-500 text-sm">{course.category}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm mt-2">
                        {packageForm.courseIds.length} curso{packageForm.courseIds.length !== 1 ? 's' : ''} seleccionado{packageForm.courseIds.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                      <button
                        onClick={handleCreatePackage}
                        className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[16px] hover:shadow-lg transition-all"
                      >
                        Crear Paquete
                      </button>
                      <button
                        onClick={() => {
                          setIsCreating(false);
                          setPackageForm({
                            name: '',
                            description: '',
                            price: 0,
                            workerLimit: 10,
                            courseIds: []
                          });
                        }}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-[16px] hover:bg-gray-300 transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de Paquetes */}
              <div className="space-y-4">
                <h3 className="text-gray-900 mb-3 flex items-center gap-2">
                  📦 Paquetes Creados ({packages.length})
                </h3>

                {packages.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-[24px]">
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No hay paquetes creados</p>
                    <p className="text-gray-400 text-sm mt-2">Crea tu primer paquete para ofrecer cursos</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {packages.map((pkg) => (
                      <div key={pkg.id} className="bg-white rounded-[20px] p-6 shadow-md border-2 border-purple-100">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-gray-900">{pkg.name}</h4>
                              <span className="px-4 py-1 bg-green-100 text-green-700 rounded-[12px]">
                                ${pkg.price}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-3">{pkg.description}</p>
                            <div className="flex gap-2 flex-wrap">
                              <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-[12px] text-sm">
                                {pkg.courseIds?.length || 0} cursos incluidos
                              </span>
                              <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-[12px] text-sm">
                                👥 {pkg.workerLimit || 10} trabajadores
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              if (confirm('¿Estás seguro de eliminar este paquete?')) {
                                try {
                                  await packagesAPI.delete(pkg.id);
                                  alert('✅ Paquete eliminado exitosamente');
                                  loadData();
                                } catch (error) {
                                  alert('Error al eliminar el paquete');
                                }
                              }
                            }}
                            className="p-2 hover:bg-red-50 rounded-[12px] transition-all"
                          >
                            <Trash2 className="w-5 h-5 text-red-600" />
                          </button>
                        </div>

                        {/* Cursos del paquete */}
                        {pkg.courseIds && pkg.courseIds.length > 0 && (
                          <div className="border-t border-gray-200 pt-4 mt-4">
                            <p className="text-gray-600 text-sm mb-2">Cursos incluidos:</p>
                            <div className="grid gap-2">
                              {pkg.courseIds.map((courseId) => {
                                const course = courses.find(c => c.id === courseId);
                                return course ? (
                                  <div key={courseId} className="bg-indigo-50 rounded-[12px] p-3 flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-indigo-600" />
                                    <div className="flex-1">
                                      <p className="text-gray-900 text-sm">{course.name}</p>
                                      <p className="text-gray-500 text-xs">{course.category}</p>
                                    </div>
                                  </div>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
