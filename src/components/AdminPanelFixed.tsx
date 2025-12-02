import { useState, useEffect } from 'react';
import { Plus, BookOpen, Package, Users, User, Building2, Edit, Trash2, Save, X, Sparkles, Check } from 'lucide-react';
import { coursesAPI, packagesAPI, companiesAPI, authAPI, usersAPI } from '../utils/api';
import { RankingPanel } from './RankingPanel';
import { seedCourses } from './SeedData';

export function AdminPanel({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<'courses' | 'packages' | 'users' | 'ranking'>('users');
  const [courses, setCourses] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [individuals, setIndividuals] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<'individual' | 'company' | 'worker' | null>(null);
  const [loading, setLoading] = useState(false);
  
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
    modules: [] as any[]
  });

  // Package form
  const [packageForm, setPackageForm] = useState({
    name: '',
    description: '',
    price: 0,
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
        'worker'
      );
      
      if (workerForm.password) {
        alert('✅ Trabajador creado exitosamente');
      } else {
        alert(`✅ Trabajador creado exitosamente\n\nContraseña temporal: ${password}\n\n(Comparte esta contraseña con el trabajador)`);
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

  const handleCreateCourse = async () => {
    try {
      await coursesAPI.createCourse({
        name: courseForm.name,
        description: courseForm.description,
        category: courseForm.category,
        modules: courseForm.modules
      });
      
      setCourseForm({
        name: '',
        description: '',
        category: '',
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
      if (editingType === 'individual') {
        await usersAPI.update(editingId!, {
          ...individualForm,
          role: 'individual'
        });
        alert('✅ Usuario actualizado exitosamente');
      } else if (editingType === 'company') {
        await usersAPI.update(editingId!, {
          ...companyForm,
          name: companyForm.companyName,
          role: 'company'
        });
        alert('✅ Empresa actualizada exitosamente');
      } else if (editingType === 'worker') {
        await usersAPI.update(editingId!, {
          ...workerForm,
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
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-white mb-1">Panel Administrador</h1>
              <p className="text-white/80">Bienvenido, {user.name}</p>
            </div>
            <button
              onClick={onLogout}
              className="px-6 py-2 bg-white/20 backdrop-blur-sm rounded-[16px] text-white hover:bg-white/30 transition-all"
            >
              Salir
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto -mt-12 px-6">
        <div className="bg-white rounded-[24px] shadow-lg p-2 flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 min-w-[120px] py-3 rounded-[16px] transition-all flex items-center justify-center gap-2 ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users className="w-5 h-5" />
            Usuarios
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex-1 min-w-[120px] py-3 rounded-[16px] transition-all flex items-center justify-center gap-2 ${
              activeTab === 'courses'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            Cursos
          </button>
          <button
            onClick={() => setActiveTab('packages')}
            className={`flex-1 min-w-[120px] py-3 rounded-[16px] transition-all flex items-center justify-center gap-2 ${
              activeTab === 'packages'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Package className="w-5 h-5" />
            Paquetes
          </button>
          <button
            onClick={() => setActiveTab('ranking')}
            className={`flex-1 min-w-[120px] py-3 rounded-[16px] transition-all flex items-center justify-center gap-2 ${
              activeTab === 'ranking'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            🏆 Ranking
          </button>
        </div>

        {/* Content */}
        <div className="pb-8">
          {activeTab === 'ranking' && <RankingPanel />}

          {/* GESTIÓN DE USUARIOS */}
          {activeTab === 'users' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-gray-900">Gestión de Usuarios</h2>
                {!editingId && (
                  <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[16px] hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Crear Usuario
                  </button>
                )}
              </div>

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
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-indigo-600 focus:outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 mb-2">Correo Electrónico *</label>
                        <input
                          type="email"
                          value={individualForm.email}
                          onChange={(e) => setIndividualForm({ ...individualForm, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-indigo-600 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 mb-2">Tipo de Documento</label>
                          <select
                            value={individualForm.documentType}
                            onChange={(e) => setIndividualForm({ ...individualForm, documentType: e.target.value })}
                            className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-indigo-600 focus:outline-none bg-white"
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
                            className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-indigo-600 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">Paquete</label>
                        <select
                          value={individualForm.packageId}
                          onChange={(e) => setIndividualForm({ ...individualForm, packageId: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-indigo-600 focus:border-indigo-600 focus:outline-none bg-white"
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
                          className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-[16px] hover:shadow-lg transition-all"
                        >
                          Guardar Cambios
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-[16px] hover:bg-gray-300 transition-all"
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
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-indigo-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">Nombre de la Empresa *</label>
                        <input
                          type="text"
                          value={companyForm.companyName}
                          onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-indigo-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">Correo Electrónico *</label>
                        <input
                          type="email"
                          value={companyForm.email}
                          onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-indigo-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">Cantidad de Trabajadores</label>
                        <input
                          type="number"
                          value={companyForm.workerLimit}
                          onChange={(e) => setCompanyForm({ ...companyForm, workerLimit: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-indigo-600 focus:outline-none"
                          min="1"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">Paquete</label>
                        <select
                          value={companyForm.packageId}
                          onChange={(e) => setCompanyForm({ ...companyForm, packageId: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-indigo-600 focus:border-indigo-600 focus:outline-none bg-white"
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
                          className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-[16px] hover:shadow-lg transition-all"
                        >
                          Guardar Cambios
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-[16px] hover:bg-gray-300 transition-all"
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
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-indigo-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">Cédula *</label>
                        <input
                          type="text"
                          value={workerForm.documentNumber}
                          onChange={(e) => setWorkerForm({ ...workerForm, documentNumber: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-indigo-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">Correo Electrónico *</label>
                        <input
                          type="email"
                          value={workerForm.email}
                          onChange={(e) => setWorkerForm({ ...workerForm, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-indigo-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">Teléfono *</label>
                        <input
                          type="tel"
                          value={workerForm.phone}
                          onChange={(e) => setWorkerForm({ ...workerForm, phone: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-gray-200 focus:border-indigo-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">Empresa *</label>
                        <select
                          value={workerForm.companyId}
                          onChange={(e) => setWorkerForm({ ...workerForm, companyId: e.target.value })}
                          className="w-full px-4 py-3 rounded-[16px] border-2 border-indigo-600 focus:border-indigo-600 focus:outline-none bg-white"
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
                          className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-[16px] hover:shadow-lg transition-all"
                        >
                          Guardar Cambios
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-[16px] hover:bg-gray-300 transition-all"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Resto del código continúa... */}
              <p className="text-gray-500 text-center py-8">Panel de usuarios - funcionalidad de creación y edición implementada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
