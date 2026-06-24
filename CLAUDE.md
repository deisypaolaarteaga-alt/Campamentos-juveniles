# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos principales

```bash
npm run dev       # Desarrollo local (http://localhost:3000)
npm run build     # Build de producción
npm run lint      # ESLint
npx tsc --noEmit  # Verificación de tipos sin compilar
```

No hay tests automatizados en este proyecto.

## Variables de entorno

Requiere `.env.local` con estas 3 variables (ver `.env.local.example`):

```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

El cliente de Supabase se inicializa a nivel de módulo en `lib/supabase/client.ts`. Si la URL es inválida, el build falla durante la generación estática — por eso el layout `app/(app)/layout.tsx` tiene `export const dynamic = 'force-dynamic'`.

## Arquitectura

### Stack
Next.js 14 App Router · TypeScript strict · Supabase (PostgreSQL + Storage) · Tailwind CSS · Recharts · React Hook Form + Zod · date-fns · sonner (toasts) · next-themes

### Flujo de datos
Todas las páginas son **Client Components** (`'use client'`). No hay Server Actions ni fetch server-side — todo el acceso a datos va directo desde el browser al cliente de Supabase vía hooks custom en `lib/hooks/`.

```
Componente 'use client'
  └── Hook (lib/hooks/)
        └── supabase client (lib/supabase/client.ts)
              └── Supabase REST API
```

### Base de datos (Supabase)
Migración única en `supabase/migrations/001_initial.sql`. Tablas:

| Tabla | Propósito |
|-------|-----------|
| `personas` | Registro de miembros con campos fijos + `campos_dinamicos JSONB` |
| `asistencias` | Un registro por `(persona_id, fecha)` — unique constraint |
| `campos_personalizados` | Definición de campos extra configurables por el admin |
| `eventos` | Definido en BD pero sin UI implementada |
| `configuracion` | Pares clave/valor JSONB (3 filas semilla) |

RLS habilitado con policies `allow_all` (acceso público sin auth por ahora).

Storage: bucket `fotos-perfil` (debe existir como público — no se crea automáticamente).

### Hooks de datos
Cada entidad tiene su hook en `lib/hooks/`:

- `usePersonas(options?)` — CRUD completo, filtra por estado/nivel
- `usePersona(id)` — perfil individual
- `useAsistenciasFecha(fecha)` — asistencias de un día
- `useAsistenciasMes(año, mes)` — vista calendario
- `useAsistenciasPersona(personaId)` — historial individual
- `useUpsertAsistencias()` — guardado masivo con `onConflict: 'persona_id,fecha'`
- `useEstadisticasDashboard()` — carga personas + asistencias del año y calcula todo en cliente
- `useCamposDinamicos()` — CRUD campos personalizados

### Rutas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | `app/page.tsx` | Redirect a `/dashboard` |
| `/dashboard` | `app/(app)/dashboard/page.tsx` | Stats + 4 gráficas (Recharts) |
| `/personas` | `app/(app)/personas/page.tsx` | Lista con vista tabla/tarjetas, filtros, exportar Excel |
| `/personas/nueva` | `app/(app)/personas/nueva/page.tsx` | Formulario creación |
| `/personas/[id]` | `app/(app)/personas/[id]/page.tsx` | Perfil con calendario personal y tendencia anual |
| `/personas/[id]/editar` | `app/(app)/personas/[id]/editar/page.tsx` | Formulario edición |
| `/asistencias` | `app/(app)/asistencias/page.tsx` | Calendario mensual, click en día abre modal |
| `/asistencias/[fecha]` | `app/(app)/asistencias/[fecha]/page.tsx` | Registro por fecha (vista standalone) |
| `/reportes` | `app/(app)/reportes/page.tsx` | Gráficas anuales/mensuales, ranking, exportar Excel/PDF |
| `/configuracion` | `app/(app)/configuracion/page.tsx` | Campos dinámicos + descripción de niveles |

### Sistema de niveles
7 niveles con color fijo: `campista → semilla → raiz → tallo → hoja → flor → fruto`. Los colores están duplicados en `types/index.ts` (`NIVEL_COLORES`) y en `tailwind.config.ts` (`theme.extend.colors.nivel`). Al modificar uno, actualizar el otro.

### Estados de asistencia
5 valores: `asistio | no_asistio | excusa | tarde | permiso`. `asistio` y `tarde` cuentan como presencia en los cálculos de porcentaje (`lib/utils/estadisticas.ts`).

### Utilidades clave
- `lib/utils.ts` — función `cn()` (clsx + tailwind-merge)
- `lib/utils/estadisticas.ts` — `calcularPorcentajeAsistencia`, `rankingAsistencia`, `detectarPatrones`, `generarResumenMes`, `tendenciaMensual`
- `lib/utils/formatearFecha.ts` — wrappers de date-fns con locale `es`
- `lib/utils/exportarExcel.ts` — usa `xlsx` para personas y reportes
- `lib/utils/exportarPDF.ts` — usa `jspdf` + `jspdf-autotable`
- `lib/utils/importarExcel.ts` — parser de Excel para importación masiva (función disponible, sin UI)

### Validaciones
- `lib/validations/personaSchema.ts` — Zod schema para formulario de persona
- `lib/validations/asistenciaSchema.ts` — Zod schema para registro de asistencia

### Estilos
Tailwind con tokens CSS (`--border`, `--primary`, etc.) definidos en `app/globals.css`. Modo oscuro via `class` en el `<html>`. No se usan componentes de shadcn/ui — todos los elementos UI son HTML nativo estilizado con Tailwind. El helper `cn()` es el único punto de composición de clases.

### Decisiones de arquitectura conocidas
- `next-themes` debe estar en `transpilePackages` en `next.config.js` porque la v0.3.x no tiene campo `exports` compatible con Next.js 14 App Router RSC.
- `recharts` y `react-smooth` también están en `transpilePackages` para evitar el error `createContext is not a function` durante SSR.
- `dynamic = 'force-dynamic'` en `app/(app)/layout.tsx` previene pre-rendering estático de las páginas que usan Supabase.
- Los campos extra de personas se guardan en `personas.campos_dinamicos` (JSONB) — el schema de la tabla no cambia al agregar campos desde Configuración.
