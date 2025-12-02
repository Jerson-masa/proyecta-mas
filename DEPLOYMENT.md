# Estado del Despliegue y Conexiones

Este documento sirve como referencia única para la infraestructura y despliegue del proyecto.

## 🌐 URLs de Producción
- **Frontend (Vercel):** [https://proyecta-mas.vercel.app/](https://proyecta-mas.vercel.app/)
- **Repositorio (GitHub):** `main/proyecta-mas` (Privado)

## 🛠 Infraestructura
- **Frontend:** React + Vite + Tailwind CSS
- **Hosting:** Vercel (Conectado vía GitHub)
- **Base de Datos / Auth:** Supabase
- **Control de Versiones:** GitHub

## 🚀 Flujo de Trabajo
1. **NO** usar servidores locales (`localhost`) para validación final.
2. Realizar cambios en el código.
3. Hacer commit y push a la rama `main`.
4. Vercel detecta automáticamente el push y despliega.
5. Verificar cambios directamente en la URL de producción.

## ⚠️ Reglas Críticas
- **Prioridad:** Siempre verificar en producción.
- **Responsive:** El diseño debe ser 100% responsive (Móvil First).
- **Estética:** Mantener diseño premium sin bordes de emulador.
