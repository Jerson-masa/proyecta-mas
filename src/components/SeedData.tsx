import { coursesAPI } from '../utils/api';

export const seedCourses = async () => {
  const sampleCourses = [
    {
      name: 'Introducción a React',
      description: 'Aprende los fundamentos de React desde cero con videos prácticos',
      category: 'Programación',
      modules: [
        {
          id: 'mod_react_1',
          name: 'Fundamentos de React',
          videos: [
            {
              id: 'vid_1_1',
              title: 'Qué es React y por qué usarlo',
              description: 'Introducción a React y sus ventajas',
              url: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8'
            },
            {
              id: 'vid_1_2',
              title: 'Tu primer componente React',
              description: 'Crea tu primer componente funcional',
              url: 'https://www.youtube.com/watch?v=bMknfKXIFA8'
            },
            {
              id: 'vid_1_3',
              title: 'Props en React',
              description: 'Aprende a pasar datos entre componentes',
              url: 'https://www.youtube.com/watch?v=IYvD9oBCuJI'
            }
          ]
        },
        {
          id: 'mod_react_2',
          name: 'Hooks y Estado',
          videos: [
            {
              id: 'vid_2_1',
              title: 'useState Hook',
              description: 'Manejo de estado en componentes funcionales',
              url: 'https://www.youtube.com/watch?v=O6P86uwfdR0'
            },
            {
              id: 'vid_2_2',
              title: 'useEffect Hook',
              description: 'Efectos secundarios en React',
              url: 'https://www.youtube.com/watch?v=0ZJgIjIuY7U'
            }
          ]
        }
      ]
    },
    {
      name: 'JavaScript Moderno',
      description: 'Domina ES6+ y las características modernas de JavaScript',
      category: 'Programación',
      modules: [
        {
          id: 'mod_js_1',
          name: 'ES6 Fundamentos',
          videos: [
            {
              id: 'vid_js_1_1',
              title: 'Arrow Functions',
              description: 'Sintaxis moderna de funciones',
              url: 'https://www.youtube.com/watch?v=h33Srr5J9nY'
            },
            {
              id: 'vid_js_1_2',
              title: 'Destructuring',
              description: 'Extracción de datos simplificada',
              url: 'https://www.youtube.com/watch?v=-vR3a11Wzt0'
            },
            {
              id: 'vid_js_1_3',
              title: 'Spread y Rest Operators',
              description: 'Operadores de propagación',
              url: 'https://www.youtube.com/watch?v=1INe_jCWq1Q'
            }
          ]
        },
        {
          id: 'mod_js_2',
          name: 'Async/Await y Promesas',
          videos: [
            {
              id: 'vid_js_2_1',
              title: 'Promesas en JavaScript',
              description: 'Manejo de operaciones asíncronas',
              url: 'https://www.youtube.com/watch?v=DHvZLI7Db8E'
            },
            {
              id: 'vid_js_2_2',
              title: 'Async/Await',
              description: 'Sintaxis moderna para código asíncrono',
              url: 'https://www.youtube.com/watch?v=V_Kr9OSfDeU'
            }
          ]
        }
      ]
    },
    {
      name: 'Diseño UI/UX con Figma',
      description: 'Crea interfaces profesionales con Figma',
      category: 'Diseño',
      modules: [
        {
          id: 'mod_figma_1',
          name: 'Introducción a Figma',
          videos: [
            {
              id: 'vid_figma_1_1',
              title: 'Primeros pasos en Figma',
              description: 'Interfaz y herramientas básicas',
              url: 'https://www.youtube.com/watch?v=FTFaQWZBqQ8'
            },
            {
              id: 'vid_figma_1_2',
              title: 'Frames y Layouts',
              description: 'Organiza tu diseño',
              url: 'https://www.youtube.com/watch?v=dXQ7IHkTiMM'
            },
            {
              id: 'vid_figma_1_3',
              title: 'Componentes y Variantes',
              description: 'Diseño de sistemas reutilizables',
              url: 'https://www.youtube.com/watch?v=y29Xwt9dET0'
            }
          ]
        },
        {
          id: 'mod_figma_2',
          name: 'Auto Layout y Responsive',
          videos: [
            {
              id: 'vid_figma_2_1',
              title: 'Auto Layout en Figma',
              description: 'Diseños flexibles y adaptativos',
              url: 'https://www.youtube.com/watch?v=TyaGpGDFczw'
            },
            {
              id: 'vid_figma_2_2',
              title: 'Diseño Responsive',
              description: 'Adapta tu diseño a diferentes pantallas',
              url: 'https://www.youtube.com/watch?v=ukDgBRxYVkQ'
            }
          ]
        }
      ]
    },
    {
      name: 'Marketing Digital Efectivo',
      description: 'Estrategias probadas para crecer tu negocio online',
      category: 'Marketing',
      modules: [
        {
          id: 'mod_mkt_1',
          name: 'Fundamentos del Marketing Digital',
          videos: [
            {
              id: 'vid_mkt_1_1',
              title: 'Introducción al Marketing Digital',
              description: 'Conceptos y estrategias básicas',
              url: 'https://www.youtube.com/watch?v=nU-IIXBWlS4'
            },
            {
              id: 'vid_mkt_1_2',
              title: 'Buyer Persona',
              description: 'Define tu cliente ideal',
              url: 'https://www.youtube.com/watch?v=vn3E_iS8x6Q'
            }
          ]
        },
        {
          id: 'mod_mkt_2',
          name: 'Redes Sociales y Content Marketing',
          videos: [
            {
              id: 'vid_mkt_2_1',
              title: 'Estrategia de Contenidos',
              description: 'Crea contenido que convierta',
              url: 'https://www.youtube.com/watch?v=9LZEZ5QuyzM'
            },
            {
              id: 'vid_mkt_2_2',
              title: 'Instagram para Negocios',
              description: 'Maximiza tu presencia en Instagram',
              url: 'https://www.youtube.com/watch?v=k4SLI4-XZv0'
            },
            {
              id: 'vid_mkt_2_3',
              title: 'TikTok Marketing',
              description: 'Aprovecha TikTok para tu marca',
              url: 'https://www.youtube.com/watch?v=5VsDJkBxvPo'
            }
          ]
        }
      ]
    },
    {
      name: 'Videos Cortos Verticales',
      description: 'Curso de ejemplo con videos en formato vertical 9:16 (estilo TikTok/Shorts)',
      category: 'Demo',
      modules: [
        {
          id: 'mod_shorts_1',
          name: 'Shorts de Prueba',
          videos: [
            {
              id: 'vid_shorts_1_1',
              title: 'Video Vertical de Ejemplo',
              description: 'Ejemplo de YouTube Short en formato vertical',
              url: 'https://www.youtube.com/shorts/MYVoE--nBnM'
            },
            {
              id: 'vid_shorts_1_2',
              title: 'Segundo Short',
              description: 'Otro ejemplo de video vertical',
              url: 'https://www.youtube.com/shorts/QX3M8Ka9vUA'
            },
            {
              id: 'vid_shorts_1_3',
              title: 'Tercer Short',
              description: 'Más contenido vertical',
              url: 'https://www.youtube.com/shorts/ZEK-l1VGQKk'
            }
          ]
        }
      ]
    },
    {
      name: 'Productividad y Organización Personal',
      description: 'Técnicas probadas para ser más productivo',
      category: 'Desarrollo Personal',
      modules: [
        {
          id: 'mod_prod_1',
          name: 'Gestión del Tiempo',
          videos: [
            {
              id: 'vid_prod_1_1',
              title: 'Técnica Pomodoro',
              description: 'Trabaja en intervalos enfocados',
              url: 'https://www.youtube.com/watch?v=VFW3Ld7JO0w'
            },
            {
              id: 'vid_prod_1_2',
              title: 'Matriz de Eisenhower',
              description: 'Prioriza tareas importantes',
              url: 'https://www.youtube.com/watch?v=tT89OZ7TNwc'
            }
          ]
        },
        {
          id: 'mod_prod_2',
          name: 'Hábitos Productivos',
          videos: [
            {
              id: 'vid_prod_2_1',
              title: 'Rutina Matutina Efectiva',
              description: 'Comienza el día con energía',
              url: 'https://www.youtube.com/watch?v=gqOjJn5oLPY'
            },
            {
              id: 'vid_prod_2_2',
              title: 'Deep Work',
              description: 'Trabajo profundo y enfocado',
              url: 'https://www.youtube.com/watch?v=gTaJhjQHcf8'
            }
          ]
        }
      ]
    }
  ];

  try {
    const createdCourses = [];
    for (const course of sampleCourses) {
      const result = await coursesAPI.create(course);
      createdCourses.push(result);
    }
    return { success: true, message: `${createdCourses.length} cursos creados exitosamente`, courses: createdCourses };
  } catch (error: any) {
    console.error('Error seeding courses:', error);
    return { success: false, error: error.message };
  }
};
