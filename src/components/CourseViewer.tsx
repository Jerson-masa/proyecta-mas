import { useState } from 'react';
import { VideoPlayer } from './VideoPlayer';

interface CourseViewerProps {
  course: any;
  enrollment: any;
  onComplete: () => void;
  onClose: () => void;
}

export function CourseViewer({ course, enrollment, onComplete, onClose }: CourseViewerProps) {
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);

  const modules = course.modules || [];
  const currentModule = modules[currentModuleIndex];

  // Si no hay módulos, mostrar mensaje
  if (!modules.length) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 z-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-[32px] p-8 max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-4xl">📚</span>
          </div>
          <h3 className="mb-2 text-gray-900">Sin módulos disponibles</h3>
          <p className="text-gray-600 text-sm mb-6">Este curso aún no tiene módulos configurados.</p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-indigo-600 text-white rounded-[20px] active:scale-95 transition-transform"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // Si hay módulos, usar el VideoPlayer con el primer video
  const firstVideo = currentModule?.videos?.[0];
  
  if (!firstVideo) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 z-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-[32px] p-8 max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-4xl">🎥</span>
          </div>
          <h3 className="mb-2 text-gray-900">Sin videos disponibles</h3>
          <p className="text-gray-600 text-sm mb-6">Este módulo aún no tiene videos configurados.</p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-indigo-600 text-white rounded-[20px] active:scale-95 transition-transform"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <VideoPlayer
      curso={course}
      moduloInicial={currentModule}
      videoInicial={firstVideo}
      userId={enrollment?.userId || 'guest'}
      onClose={onClose}
      onBackToModulos={onClose}
    />
  );
}
