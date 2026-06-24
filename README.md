# GestiónApp — Control de Asistencias

Plataforma completa de gestión de personas y control de asistencias construida con Next.js 14, Supabase y Tailwind CSS.

## Características

- 👥 Gestión completa de personas con campos dinámicos personalizados
- 📅 Registro masivo de asistencias por día (5 estados: asistió, no asistió, excusa, tarde, permiso)
- 📊 Dashboard con estadísticas en tiempo real y gráficas interactivas
- 📈 Módulo de reportes con ranking, tendencias y análisis de patrones
- 🌙 Modo oscuro/claro
- 📱 Responsive: funciona desde 320px hasta 1440px
- 📤 Exportación a Excel y PDF
- 🎨 Sistema de niveles de formación con colores: Campista → Semilla → Raíz → Tallo → Hoja → Flor → Fruto

---

## Instalación en 5 pasos

### 1. Clonar e instalar dependencias

```bash
git clone <tu-repo>
cd gestion-asistencias
npm install
```

### 2. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor** y ejecuta el archivo `supabase/migrations/001_initial.sql`
3. En **Storage**, crea un bucket público llamado `fotos-perfil`

### 3. Configurar variables de entorno

```bash
cp .env.local.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase (las encuentras en **Project Settings → API**):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 4. Instalar componentes shadcn/ui

```bash
npx shadcn@latest init
npx shadcn@latest add button card dialog dropdown-menu form input label select table tabs badge avatar calendar popover tooltip sheet skeleton separator progress switch textarea command alert alert-dialog
```

### 5. Ejecutar

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) — redirige automáticamente al dashboard.

---

## Estructura del proyecto

```
/app/(app)/          → Páginas principales (con layout sidebar)
  dashboard/         → Dashboard con estadísticas
  personas/          → Lista, nueva, perfil y editar personas
  asistencias/       → Calendario y registro de asistencias
  reportes/          → Gráficas y ranking exportable
  configuracion/     → Campos dinámicos y ajustes del sistema

/components/
  layout/            → Sidebar, Header, MobileNav
  personas/          → Formularios, tabla, cards, foto
  asistencias/       → Calendario interactivo, registro rápido
  dashboard/         → Tarjetas de estadísticas y gráficas
  reportes/          → Gráficas reutilizables y ranking

/lib/
  hooks/             → usePersonas, useAsistencias, useEstadisticas...
  utils/             → Estadísticas, exportar Excel/PDF, importar Excel
  validations/       → Schemas Zod
  supabase/          → Clientes browser y server

/supabase/migrations/
  001_initial.sql    → Tablas, índices, RLS y datos semilla
```

## Stack tecnológico

| Herramienta | Uso |
|---|---|
| Next.js 14 (App Router) | Framework |
| TypeScript strict | Lenguaje |
| Supabase (PostgreSQL) | Base de datos + Storage |
| Tailwind CSS + shadcn/ui | Estilos |
| Recharts | Gráficas |
| React Hook Form + Zod | Formularios y validación |
| date-fns | Manejo de fechas |
| xlsx + jsPDF | Exportación |
| sonner | Notificaciones toast |
| next-themes | Modo oscuro/claro |
