import { z } from 'zod';

export const personaSchema = z.object({
  nombre_completo: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  documento: z.string().min(5, 'El documento debe tener al menos 5 caracteres'),
  tipo_documento: z.enum(['CC', 'TI', 'CE', 'PP', 'NIT']),
  fecha_nacimiento: z.string().optional(),
  año_ingreso: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  parentesco: z.string().optional(),
  genero: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  direccion: z.string().optional(),
  estado: z.enum(['activo', 'inactivo']),
  nivel_formacion: z.enum(['campista', 'semilla', 'raiz', 'tallo', 'hoja', 'flor', 'fruto']),
  habilidades: z.array(z.string()).optional(),
  profesion: z.string().optional(),
  estudios: z.string().optional(),
  observaciones: z.string().optional(),
  foto_url: z.string().optional(),
  notas: z.string().optional(),
  tipo_sangre: z.string().optional(),
  eps: z.string().optional(),
  alergias: z.string().optional(),
  contacto_emergencia_nombre: z.string().optional(),
  contacto_emergencia_telefono: z.string().optional(),
  foto_documento_url: z.string().optional(),
  campos_dinamicos: z.record(z.unknown()).optional(),
});

export type PersonaFormData = z.infer<typeof personaSchema>;
