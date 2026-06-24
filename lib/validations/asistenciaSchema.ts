import { z } from 'zod';

export const asistenciaSchema = z.object({
  persona_id: z.string().uuid(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido'),
  estado: z.enum(['asistio', 'no_asistio', 'excusa', 'tarde', 'permiso']),
  observacion: z.string().optional(),
  registrado_por: z.string().optional(),
});

export type AsistenciaFormData = z.infer<typeof asistenciaSchema>;
