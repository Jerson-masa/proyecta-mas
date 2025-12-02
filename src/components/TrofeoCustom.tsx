interface TrofeoCustomProps {
  posicion: 0 | 1 | 2;
  size?: 'sm' | 'md' | 'lg';
}

export function TrofeoCustom({ posicion, size = 'md' }: TrofeoCustomProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
    lg: 'w-12 h-12'
  };

  // Primer Lugar - Trofeo Dorado con Estrella
  if (posicion === 0) {
    return (
      <div className={`${sizeClasses[size]} relative`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Resplandor */}
          <circle cx="50" cy="50" r="45" fill="url(#goldGlow)" opacity="0.3" />
          
          {/* Base del trofeo */}
          <path
            d="M35 70 L35 75 L40 80 L60 80 L65 75 L65 70 Z"
            fill="url(#goldGradient)"
            stroke="#D97706"
            strokeWidth="1"
          />
          
          {/* Copa */}
          <path
            d="M30 35 L30 50 Q30 60 40 65 L60 65 Q70 60 70 50 L70 35 Z"
            fill="url(#goldGradient)"
            stroke="#D97706"
            strokeWidth="1.5"
          />
          
          {/* Asas */}
          <path
            d="M25 35 Q20 35 20 42 Q20 48 25 48"
            fill="none"
            stroke="url(#goldGradient)"
            strokeWidth="3"
          />
          <path
            d="M75 35 Q80 35 80 42 Q80 48 75 48"
            fill="none"
            stroke="url(#goldGradient)"
            strokeWidth="3"
          />
          
          {/* Estrella en el centro */}
          <path
            d="M50 40 L52 46 L58 46 L53 50 L55 56 L50 52 L45 56 L47 50 L42 46 L48 46 Z"
            fill="#FEF3C7"
            stroke="#F59E0B"
            strokeWidth="0.5"
          />
          
          {/* Brillo */}
          <ellipse cx="45" cy="42" rx="8" ry="12" fill="white" opacity="0.4" />
          
          {/* Gradientes */}
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="50%" stopColor="#FACC15" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <radialGradient id="goldGlow">
              <stop offset="0%" stopColor="#FCD34D" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FCD34D" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
        
        {/* Partículas flotantes */}
        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-300 rounded-full animate-ping" />
        <div className="absolute top-0 -right-2 w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
      </div>
    );
  }

  // Segundo Lugar - Trofeo Plateado con Medalla
  if (posicion === 1) {
    return (
      <div className={`${sizeClasses[size]} relative`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Resplandor */}
          <circle cx="50" cy="50" r="45" fill="url(#silverGlow)" opacity="0.2" />
          
          {/* Base del trofeo */}
          <path
            d="M35 70 L35 75 L40 80 L60 80 L65 75 L65 70 Z"
            fill="url(#silverGradient)"
            stroke="#64748B"
            strokeWidth="1"
          />
          
          {/* Copa */}
          <path
            d="M30 35 L30 50 Q30 60 40 65 L60 65 Q70 60 70 50 L70 35 Z"
            fill="url(#silverGradient)"
            stroke="#64748B"
            strokeWidth="1.5"
          />
          
          {/* Asas */}
          <path
            d="M25 35 Q20 35 20 42 Q20 48 25 48"
            fill="none"
            stroke="url(#silverGradient)"
            strokeWidth="3"
          />
          <path
            d="M75 35 Q80 35 80 42 Q80 48 75 48"
            fill="none"
            stroke="url(#silverGradient)"
            strokeWidth="3"
          />
          
          {/* Número 2 */}
          <text x="50" y="54" textAnchor="middle" fontSize="20" fill="#475569" fontWeight="bold">
            2
          </text>
          
          {/* Brillo */}
          <ellipse cx="45" cy="42" rx="8" ry="12" fill="white" opacity="0.5" />
          
          {/* Gradientes */}
          <defs>
            <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F1F5F9" />
              <stop offset="50%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>
            <radialGradient id="silverGlow">
              <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
        
        {/* Brillo sutil */}
        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-slate-200 rounded-full animate-pulse" />
      </div>
    );
  }

  // Tercer Lugar - Trofeo Bronce
  if (posicion === 2) {
    return (
      <div className={`${sizeClasses[size]} relative`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Resplandor */}
          <circle cx="50" cy="50" r="45" fill="url(#bronzeGlow)" opacity="0.2" />
          
          {/* Base del trofeo */}
          <path
            d="M35 70 L35 75 L40 80 L60 80 L65 75 L65 70 Z"
            fill="url(#bronzeGradient)"
            stroke="#92400E"
            strokeWidth="1"
          />
          
          {/* Copa */}
          <path
            d="M30 35 L30 50 Q30 60 40 65 L60 65 Q70 60 70 50 L70 35 Z"
            fill="url(#bronzeGradient)"
            stroke="#92400E"
            strokeWidth="1.5"
          />
          
          {/* Asas */}
          <path
            d="M25 35 Q20 35 20 42 Q20 48 25 48"
            fill="none"
            stroke="url(#bronzeGradient)"
            strokeWidth="3"
          />
          <path
            d="M75 35 Q80 35 80 42 Q80 48 75 48"
            fill="none"
            stroke="url(#bronzeGradient)"
            strokeWidth="3"
          />
          
          {/* Número 3 */}
          <text x="50" y="54" textAnchor="middle" fontSize="20" fill="#78350F" fontWeight="bold">
            3
          </text>
          
          {/* Brillo */}
          <ellipse cx="45" cy="42" rx="8" ry="12" fill="white" opacity="0.3" />
          
          {/* Gradientes */}
          <defs>
            <linearGradient id="bronzeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FED7AA" />
              <stop offset="50%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#C2410C" />
            </linearGradient>
            <radialGradient id="bronzeGlow">
              <stop offset="0%" stopColor="#FB923C" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#FB923C" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
        
        {/* Brillo sutil */}
        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-orange-300 rounded-full animate-pulse" />
      </div>
    );
  }

  return null;
}