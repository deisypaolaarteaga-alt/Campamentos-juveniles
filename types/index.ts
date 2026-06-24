export type NivelFormacion = 'campista' | 'semilla' | 'raiz' | 'tallo' | 'hoja' | 'flor' | 'fruto';
export type EstadoPersona = 'activo' | 'inactivo';
export type EstadoAsistencia = 'asistio' | 'no_asistio' | 'excusa' | 'tarde' | 'permiso';
export type TipoDocumento = 'CC' | 'TI' | 'CE' | 'PP' | 'NIT';

export interface Persona {
  id: string;
  nombre_completo: string;
  documento: string;
  tipo_documento: TipoDocumento;
  fecha_nacimiento?: string;
  edad?: number;
  año_ingreso: number;
  parentesco?: string;
  genero?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  estado: EstadoPersona;
  nivel_formacion: NivelFormacion;
  habilidades?: string[];
  profesion?: string;
  estudios?: string;
  observaciones?: string;
  foto_url?: string;
  notas?: string;
  // Campos médicos y de emergencia
  tipo_sangre?: string;
  eps?: string;
  alergias?: string;
  contacto_emergencia_nombre?: string;
  contacto_emergencia_telefono?: string;
  foto_documento_url?: string;
  logo_bosque_url?: string;
  campos_dinamicos: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Asistencia {
  id: string;
  persona_id: string;
  fecha: string;
  estado: EstadoAsistencia;
  observacion?: string;
  registrado_por?: string;
  created_at: string;
  persona?: Persona;
}

export interface CampoPersonalizado {
  id: string;
  nombre_campo: string;
  etiqueta: string;
  tipo: 'text' | 'number' | 'date' | 'select' | 'boolean' | 'textarea';
  opciones?: string[];
  obligatorio: boolean;
  orden: number;
  activo: boolean;
}

export interface Evento {
  id: string;
  titulo: string;
  descripcion?: string;
  fecha: string;
  hora_inicio?: string;
  hora_fin?: string;
  tipo: string;
  obligatorio: boolean;
  created_at: string;
}

export interface EstadisticasMes {
  mes: number;
  año: number;
  total_personas: number;
  total_asistencias: number;
  total_ausencias: number;
  total_excusas: number;
  total_tarde: number;
  total_permiso: number;
  porcentaje_asistencia: number;
}

export interface ResumenPersona {
  persona: Persona;
  total_asistencias: number;
  total_ausencias: number;
  porcentaje: number;
  racha_actual: number;
}

export interface ConfiguracionSistema {
  id: string;
  clave: string;
  valor: unknown;
  created_at: string;
}

export const NIVELES: NivelFormacion[] = ['campista', 'semilla', 'raiz', 'tallo', 'hoja', 'flor', 'fruto'];

// Colores por nivel de formación — metáfora de crecimiento natural
export const NIVEL_COLORES: Record<NivelFormacion, string> = {
  campista: '#7A8C8C',  /* teal neutro — recién llegado   */
  semilla:  '#8B5A2B',  /* tierra cálida — semilla en suelo */
  raiz:     '#7A3C1E',  /* raíz profunda oscura           */
  tallo:    '#2D7048',  /* verde medio — tallo joven      */
  hoja:     '#1A5C35',  /* verde selva profundo           */
  flor:     '#2B5FA5',  /* azul cielo vibrante — flor     */
  fruto:    '#A87C1A',  /* dorado cosecha — fruto maduro  */
};

export const NIVEL_EMOJIS: Record<NivelFormacion, string> = {
  campista: '🏕️',
  semilla: '🌰',
  raiz: '🌿',
  tallo: '🌱',
  hoja: '🍃',
  flor: '🌸',
  fruto: '🍎',
};

export const NIVEL_LABELS: Record<NivelFormacion, string> = {
  campista: 'Campista',
  semilla: 'Semilla',
  raiz: 'Raíz',
  tallo: 'Tallo',
  hoja: 'Hoja',
  flor: 'Flor',
  fruto: 'Fruto',
};

export const ESTADO_ASISTENCIA_COLORES: Record<EstadoAsistencia, string> = {
  asistio:    '#2D7048',  /* verde selva — presencia plena  */
  no_asistio: '#B83A2E',  /* coral ladrillo — ausencia      */
  excusa:     '#A87C1A',  /* ámbar — excusa justificada     */
  tarde:      '#C67E1A',  /* dorado ámbar vivo — tardanza   */
  permiso:    '#2B5FA5',  /* azul cielo — permiso oficial   */
};

export const ESTADO_ASISTENCIA_LABELS: Record<EstadoAsistencia, string> = {
  asistio: 'Asistió',
  no_asistio: 'No asistió',
  excusa: 'Excusa',
  tarde: 'Tarde',
  permiso: 'Permiso',
};
