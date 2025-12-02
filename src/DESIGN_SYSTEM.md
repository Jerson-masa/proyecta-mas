# 📐 Sistema de Diseño Estilo Platzi

Este documento describe el sistema de diseño aplicado a la plataforma, basado en los principios de Platzi.

## 🎨 Variables CSS (en `/styles/globals.css`)

### Espaciado
```css
--spacing-micro: 0.25rem;    /* 4px */
--spacing-xs: 0.5rem;        /* 8px */
--spacing-sm: 0.75rem;       /* 12px */
--spacing-md: 1rem;          /* 16px */
--spacing-lg: 1.25rem;       /* 20px */
--spacing-xl: 1.5rem;        /* 24px */
--spacing-2xl: 2rem;         /* 32px */
--spacing-3xl: 3rem;         /* 48px */
--spacing-4xl: 4rem;         /* 64px */
--spacing-5xl: 5rem;         /* 80px */
```

### Border Radius
```css
--radius-sm: 0.5rem;         /* 8px */
--radius-md: 0.75rem;        /* 12px */
--radius-lg: 1rem;           /* 16px */
--radius-xl: 1.25rem;        /* 20px */
--radius-2xl: 1.5rem;        /* 24px */
```

### Heights (Componentes)
```css
--height-input: 3rem;          /* 48px - inputs */
--height-button: 3rem;         /* 48px - botones */
--height-metric-card: 8.5rem;  /* 136px - cards métricas */
--height-table-row: 3.5rem;    /* 56px - filas tabla */
```

### Max Widths
```css
--max-width-container: 80rem;   /* 1280px - contenedor */
--max-width-modal: 32rem;       /* 512px - modales */
--max-width-card: 20rem;        /* 320px - cards */
```

## 📏 Clases Tailwind Recomendadas

### Layout
- Contenedor principal: `max-w-[1280px] mx-auto`
- Padding horizontal: `px-6 md:px-8` (24px → 32px)
- Padding vertical: `py-8` (32px)

### Cards
- Padding: `p-6` (24px)
- Border radius: `rounded-2xl` (16px)
- Gap entre cards: `gap-6` (24px)
- Shadow: `shadow-sm hover:shadow-md`

### Inputs & Buttons
- Altura inputs: `h-12` (48px)
- Altura botones: `h-12` (48px)
- Border radius: `rounded-2xl` (16px)
- Padding horizontal: `px-6` (24px)

### Formularios
- Espaciado entre campos: `space-y-5` (20px)
- Espaciado entre secciones: `space-y-6` (24px)

### Grid Systems
```
Desktop (>1024px):  grid-cols-3 o grid-cols-4
Tablet (768-1024px): grid-cols-2
Mobile (<768px):    grid-cols-1
Gap: gap-6 (24px)
```

### Métricas Dashboard
- Grid: `grid-cols-2 md:grid-cols-4`
- Padding: `p-5` (20px)
- Icon size: `w-10 h-10` (40px)
- Number size: `text-3xl`
- Label size: `text-sm`

### Gráficos
- Padding: `p-6` (24px)
- Height: `height={240}` (ResponsiveContainer)
- Title size: `text-lg`
- Gap: `gap-6` (24px)

## 🎯 Principios de Diseño

1. **Espaciado Generoso**: Más aire entre elementos (nunca menos de 16px en desktop)
2. **Componentes Grandes**: Botones e inputs de 48px mínimo (mejor para touch)
3. **Bordes Muy Redondeados**: rounded-2xl (16px) como estándar
4. **Jerarquía Clara**: Tamaños de texto con diferencias notables
5. **Hover States**: Siempre incluir transiciones suaves
6. **Responsive**: Mobile-first con breakpoints claros

## ✅ Checklist de Implementación

- [x] Variables CSS definidas en globals.css
- [x] Header con espaciado Platzi
- [x] Stats cards actualizadas
- [x] Métricas dashboard más grandes
- [x] Gráficos con más padding
- [x] Formularios con mejor espaciado
- [ ] Todos los inputs con h-12
- [ ] Todos los botones con h-12
- [ ] Tablas con height-table-row
- [ ] Modales con max-width correcto

## 🔄 Tareas Pendientes

1. Reemplazar todos los `h-11` por `h-12` en inputs
2. Actualizar SelectTrigger con `h-12`
3. Aplicar sistema a otros paneles (Empresa, Trabajador, Individual)
4. Documentar componentes reutilizables
