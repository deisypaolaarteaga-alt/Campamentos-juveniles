'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PersonaForm, PersonaFiles } from '@/components/personas/PersonaForm';
import { usePersona, usePersonas } from '@/lib/hooks/usePersonas';
import { PersonaFormData } from '@/lib/validations/personaSchema';
import { subirFotoPerfil, subirFotoDocumento } from '@/lib/utils/subirFoto';
import { toast } from 'sonner';

export default function EditarCampistaPage() {
  const { id } = useParams<{ id: string }>();
  const { persona, loading } = usePersona(id);
  const { actualizarPersona } = usePersonas();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (data: PersonaFormData, files: PersonaFiles): Promise<boolean> => {
    setSaving(true);
    try {
      const updatedData = { ...data };

      // Subir fotos nuevas antes de actualizar (ya tenemos el ID)
      if (files.fotoFile) {
        const url = await subirFotoPerfil(id, files.fotoFile);
        if (url) {
          updatedData.foto_url = url;
        } else {
          toast.error('La foto de perfil no se pudo subir — se conserva la anterior.');
        }
      }

      if (files.fotoDocFile) {
        const url = await subirFotoDocumento(id, files.fotoDocFile);
        if (url) {
          updatedData.foto_documento_url = url;
        } else {
          toast.error('La foto del documento no se pudo subir — se conserva la anterior.');
        }
      }

      return await actualizarPersona(id, updatedData);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error inesperado';
      console.error('[EditarCampista] unexpected error:', msg, err);
      toast.error(msg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="h-8 bg-muted rounded-xl w-32 skeleton-shimmer" />
        <div className="h-64 bg-muted rounded-2xl skeleton-shimmer" />
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-3">Campista no encontrado</p>
        <Link href="/personas" className="text-primary hover:underline text-sm">
          Volver a campistas
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/personas/${id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al perfil
        </Link>
        <h1 className="font-montserrat font-bold text-2xl">Editar campista</h1>
        <p className="text-muted-foreground text-sm mt-1">{persona.nombre_completo}</p>
      </div>
      <PersonaForm persona={persona} onSubmit={handleSubmit} loading={saving} />
    </div>
  );
}
