# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos principales

```bash
npm run dev                              # Desarrollo local (http://localhost:3000)
npm run dev -- --hostname 0.0.0.0       # Accesible desde celular en red local
npm run build                           # Build de producción
npm run lint                            # ESLint
npx tsc --noEmit --skipLibCheck         # Verificación de tipos sin compilar
```

El puerto 3000 puede estar ocupado — Next.js usa automáticamente el 3001. La IP local de la máquina de desarrollo es `192.168.1.6`, así que la URL para el celular es `http://192.168.1.6:3001`.

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
Next.js 14 App Router · TypeScript strict · Supabase (PostgreSQL + Auth + Storage) · Tailwind CSS · Recharts · React Hook Form + Zod · date-fns · sonner (toasts) · next-themes · next-pwa (deshabilitado en dev)

### Flujo de datos
Todas las páginas son **Client Components** (`'use client'`). No hay Server Actions ni fetch server-side — todo el acceso a datos va directo desde el browser al cliente de Supabase vía hooks custom en `lib/hooks/`.

```
Componente 'use client'
  └── Hook (lib/hooks/)
        └── supabase client (lib/supabase/client.ts)
              └── Supabase REST API / Auth
```

### Autenticación
Supabase Auth con email/password. El flujo completo:

1. Usuario entra a `/login` o `/registro`
2. Tras registro exitoso → `/onboarding` (crear su Bosque)
3. Tras onboarding o login → `/dashboard`
4. Si accede a ruta protegida sin sesión → redirige a `/login` (manejo en cada page con `useAuth`)

**`useAuth`** (`lib/hooks/useAuth.ts`) — expone: `user`, `loading`, `login()`, `registro()`, `logout()`, `recuperar()`

No hay middleware de Next.js para proteger rutas — cada página protegida hace su propia verificación via `supabase.auth.getUser()` o `useAuth`.

### Base de datos (Supabase)

No hay archivos de migración en el repo — el esquema se aplica manualmente en el SQL Editor de Supabase. Tablas principales:

| Tabla | Propósito |
|-------|-----------|
| `bosque` | Grupo/equipo del líder: `nombre`, `ciudad`, `logo_url`, `user_id` (FK a auth.users) |
| `personas` | Registro de miembros con campos fijos + `campos_dinamicos JSONB`, `user_id` |
| `asistencias` | Un registro por `(persona_id, fecha)` — unique constraint |
| `campos_personalizados` | Definición de campos extra configurables |
| `eventos` | Definido en BD pero sin UI implementada |
| `configuracion` | Pares clave/valor JSONB |

**RLS:** Todas las tablas tienen RLS activo. Políticas aplicadas en Supabase SQL Editor el 2026-06-24:
- `bosque`: política `usuario_ve_su_bosque` (SELECT, `auth.uid() = user_id`)
- `personas`: 4 políticas (`usuario_ve/crea/actualiza/elimina_sus_personas`) — filtran por `auth.uid() = user_id` en SELECT/UPDATE/DELETE y `WITH CHECK` en INSERT/UPDATE
- `asistencias`: 4 políticas (`usuario_ve/crea/actualiza/elimina_sus_asistencias`) — filtran vía `EXISTS (SELECT 1 FROM personas WHERE personas.id = persona_id AND personas.user_id = auth.uid())` porque `asistencias` no tiene `user_id` directo

Storage: bucket `fotos-perfil` (debe existir como público). `lib/utils/subirFoto.ts` maneja la subida.

### Hooks de datos
Cada entidad tiene su hook en `lib/hooks/`:

- `useAuth()` — sesión de usuario, login/registro/logout/recuperar
- `useBosque()` — datos del bosque del usuario autenticado (filtra por `user_id`)
- `usePersonas(options?)` — CRUD completo, filtra por estado/nivel
- `usePersona(id)` — perfil individual
- `useAsistenciasFecha(fecha)` — asistencias de un día
- `useAsistenciasMes(año, mes)` — vista calendario
- `useAsistenciasPersona(personaId)` — historial individual
- `useUpsertAsistencias()` — guardado masivo con `onConflict: 'persona_id,fecha'`
- `useEstadisticasDashboard()` — carga personas + asistencias del año y calcula todo en cliente
- `useCamposDinamicos()` — CRUD campos personalizados
- `useLocalStorage(key, defaultValue)` — persistencia de preferencias UI

### Rutas

**Grupo `(auth)` — sin navegación, fondo crema centrado:**

| Ruta | Descripción |
|------|-------------|
| `/login` | Email + password, redirect a `/dashboard` |
| `/registro` | Crear cuenta, redirect a `/onboarding` |
| `/recuperar` | Envío de link por email |

**Grupo `(app)` — con Sidebar (desktop) + Header + MobileNav (móvil):**

| Ruta | Descripción |
|------|-------------|
| `/` | Redirect a `/dashboard` |
| `/dashboard` | Bosque identity card + 3 stats + lista de campistas con buscador |
| `/onboarding` | Crear el Bosque (nombre, ciudad, logo) — primer acceso tras registro |
| `/personas` | Lista campistas: móvil = filas, desktop = tabla/tarjetas con filtros |
| `/personas/nueva` | Formulario creación |
| `/personas/[id]` | Perfil con calendario personal y tendencia anual |
| `/personas/[id]/editar` | Formulario edición |
| `/asistencias` | Selector de fecha (flechas prev/next) + lista de campistas para marcar |
| `/asistencias/[fecha]` | Vista standalone por fecha |
| `/reportes` | Gráficas anuales/mensuales (Recharts), ranking, exportar Excel/PDF |
| `/configuracion` | Campos dinámicos + descripción de niveles |

### Sistema de niveles
7 niveles con color fijo: `campista → semilla → raiz → tallo → hoja → flor → fruto`. Los colores están duplicados en `types/index.ts` (`NIVEL_COLORES`) y en `tailwind.config.ts` (`theme.extend.colors.nivel`). Al modificar uno, actualizar el otro.

### Estados de asistencia
5 valores: `asistio | no_asistio | excusa | tarde | permiso`. `asistio` y `tarde` cuentan como presencia en los cálculos de porcentaje (`lib/utils/estadisticas.ts`).

### Utilidades clave
- `lib/utils.ts` — función `cn()` (clsx + tailwind-merge)
- `lib/utils/estadisticas.ts` — `calcularPorcentajeAsistencia`, `rankingAsistencia`, `detectarPatrones`, `generarResumenMes`, `tendenciaMensual`
- `lib/utils/formatearFecha.ts` — wrappers de date-fns con locale `es`
- `lib/utils/calcularEdad.ts` — cálculo de edad a partir de fecha de nacimiento
- `lib/utils/subirFoto.ts` — sube fotos a Supabase Storage (perfil y logo de bosque)
- `lib/utils/exportarExcel.ts` — usa `xlsx` para personas y reportes
- `lib/utils/exportarPDF.ts` — usa `jspdf` + `jspdf-autotable`
- `lib/utils/importarExcel.ts` — parser de Excel para importación masiva (función disponible, sin UI)

### Validaciones
- `lib/validations/personaSchema.ts` — Zod schema para formulario de persona
- `lib/validations/asistenciaSchema.ts` — Zod schema para registro de asistencia

### Layout mobile
- `MobileNav` (`components/layout/MobileNav.tsx`): barra de navegación fija en la parte inferior, `h-64px`, solo visible en `< lg`. Usa clase `.mobile-nav` que incluye `padding-bottom: env(safe-area-inset-bottom)` para iPhones con notch.
- Patrón de padding para no quedar tapado por la barra: `pb-24 md:pb-6` en el `<main>` del `(app)/layout.tsx`. El `pb-24` (96px) cubre los 64px de la MobileNav más margen. `md:pb-6` en desktop donde no hay MobileNav.
- El FAB de "Nuevo campista" en `/personas` es `fixed bottom-20 right-4` (encima de la MobileNav).

### Estructura split-panel del layout principal
El `app/(app)/layout.tsx` usa un split-panel donde **solo la columna de contenido scrollea**, no el documento completo:
```tsx
<div className="flex h-screen w-full">          {/* viewport fijo, sin overflow */}
  <Sidebar />                                    {/* h-screen, sticky top-0 */}
  <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">  {/* SOLO este div scrollea */}
    <Header />                                   {/* sticky top-0 dentro del scroll container */}
    <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">{children}</main>
  </div>
  <MobileNav />                                  {/* fixed bottom-0 al viewport */}
</div>
```
**Invariantes críticos:** El div exterior DEBE ser `h-screen` (no `min-h-screen`) y NO debe tener `overflow-x-hidden`. Ver "Trampas comunes" para entender por qué.

### Estilos
Tailwind con tokens CSS (`--primario`, `--fondo`, `--texto`, etc.) definidos en `app/globals.css`. Modo oscuro via `class` en el `<html>`. No se usan componentes de shadcn/ui — todos los elementos UI son HTML nativo estilizado con Tailwind. El helper `cn()` es el único punto de composición de clases.

Clases de utilidad globales en `globals.css`:
- `.btn-cj-primary` — botón rojo primario
- `.btn-cj-accent` — botón ámbar
- `.skeleton-shimmer` — loading skeleton animado
- `.card-hover` — hover elevación en cards desktop
- `.mobile-nav` — safe-area padding para elementos fijos inferiores

### Decisiones de arquitectura conocidas
- `next-themes` debe estar en `transpilePackages` en `next.config.js` porque la v0.3.x no tiene campo `exports` compatible con Next.js 14 App Router RSC.
- `recharts` y `react-smooth` también están en `transpilePackages` para evitar el error `createContext is not a function` durante SSR.
- `dynamic = 'force-dynamic'` en `app/(app)/layout.tsx` previene pre-rendering estático de las páginas que usan Supabase.
- Los campos extra de personas se guardan en `personas.campos_dinamicos` (JSONB) — el schema de la tabla no cambia al agregar campos desde Configuración.
- El root layout (`app/layout.tsx`) tiene un `<div id="app-root" style={{ overflowX: 'hidden', ... }}>` como wrapper directo de `{children}`, más `overflow-x: hidden; max-width: 100vw` en `html` y `body` en `globals.css`. Ninguna de estas capas evita el scroll horizontal causado por el zoom automático de iOS — ver "Trampas comunes".
- `viewport` meta tag incluye `maximum-scale=1, user-scalable=no`. Esto NO es suficiente para evitar el zoom automático de iOS en inputs con font-size < 16px (iOS 16+ lo ignora por accesibilidad). El fix real es la regla `input, textarea, select { font-size: max(16px, 1em) }` en `globals.css`.
- `Recharts` `ResponsiveContainer` debe tener su div padre con `overflow: hidden` para evitar que el SVG crezca más allá del viewport en iOS (bug conocido de ResizeObserver). Usar `width="99%"` en lugar de `"100%"` como workaround adicional.

### Trampas comunes
- **Scroll horizontal en mobile — causa 1, estática**: NO usar `overflow-x: hidden` solo en `html/body` — no funciona en iOS. Tener múltiples capas de `overflow-x: hidden` (html, body, #app-root) tampoco ayuda si algo desborda el layout. Nunca usar `100vw` para anchos de contenedores (usar `100%`). No dejar reglas de debug (`* { outline: 1px solid red }`) en producción: el outline del elemento `<html>` se extiende 1px fuera del viewport y `overflow: hidden` no lo clipa (solo `overflow: clip` lo haría).
- **Scroll horizontal en mobile — causa 2, al enfocar inputs**: iOS Safari hace zoom automático al enfocar cualquier input/textarea/select con `font-size < 16px`. Ese zoom desplaza el layout y genera scroll horizontal visible. El `maximum-scale=1, user-scalable=no` del viewport meta NO previene este comportamiento en iOS 16+. El fix real y permanente es `input, textarea, select { font-size: max(16px, 1em) }` en `globals.css`. **CRÍTICO: esta regla debe estar FUERA de cualquier `@layer`** — si se pone en `@layer base`, Tailwind's `text-sm` (en `@layer utilities`) la sobreescribe siempre porque CSS Cascade Layers: `utilities > base` sin importar especificidad. Las reglas unlayered ganan sobre todas las `@layer`. Todo el proyecto usa `text-sm` (14px) en los campos — esa clase sigue ahí pero la regla unlayered la sobreescribe para el tamaño real renderizado.
- **`overflow-x-hidden` en un contenedor flex rompe `sticky` y `fixed` de sus hijos**: Según CSS2.1 §11.1.1, cuando `overflow-x` es no-`visible` y `overflow-y` no está especificado (defaulta a `visible`), el browser **promueve `overflow-y` a `auto`** automáticamente. Esto convierte el elemento en un scroll container. Si ese container crece con el contenido (`min-h-screen`) en vez de ser tamaño fijo (`h-screen`), nunca scrollea — y `position: sticky` de sus hijos nunca activa (queda como static). Además, en WebKit/Safari, `position: fixed` dentro de un scroll container se posiciona relativo al viewport de ESE container, no al browser viewport. Resultado: Sidebar y MobileNav se desplazan con el contenido. **Regla:** en el split-panel principal, usar `h-screen` (no `min-h-screen`) en el div exterior y `overflow-y-auto` solo en la columna de contenido. Nunca poner `overflow-x-hidden` en el div flex exterior del layout.
- **Recharts en mobile**: `margin={{ left: -20 }}` en BarChart/LineChart hace que el eje Y se salga del SVG. Cambiar a `left: 0` o envolver en `overflow: hidden`.
- **Botones fijos en iOS**: cualquier `position: fixed` en la parte inferior necesita la clase `.mobile-nav` o `padding-bottom: env(safe-area-inset-bottom)` para respetar el home indicator del iPhone.
- **`bosque` table**: cada usuario tiene exactamente un bosque. `useBosque()` filtra por `user_id` del usuario autenticado — si no hay sesión, retorna `null`.
