'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PersonaForm, PersonaFiles } from '@/components/personas/PersonaForm';
import { PersonaFormData } from '@/lib/validations/personaSchema';
import { supabase } from '@/lib/supabase/client';
import { subirFotoPerfil, subirFotoDocumento } from '@/lib/utils/subirFoto';
import { toast } from 'sonner';

export default function NuevoCampistaPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: PersonaFormData, files: PersonaFiles): Promise<boolean> => {
    setLoading(true);
    try {
      // Paso 1: crear persona sin fotos para obtener el ID
      const { foto_url: _fu, foto_documento_url: _fdu, ...baseData } = data;

      const { data: nueva, error: insertError } = await supabase
        .from('personas')
        .insert([baseData])
        .select()
        .single();

      if (insertError) {
        console.error('[NuevoCampista] insert error:', insertError.message, insertError);
        toast.error(`Error al registrar: ${insertError.message}`);
        return false;
      }

      const personaId = nueva.id as string;

      // Paso 2: subir fotos usando el ID recién creado
      const updates: { foto_url?: string; foto_documento_url?: string } = {};

      if (files.fotoFile) {
        const url = await subirFotoPerfil(personaId, files.fotoFile);
        if (url) {
          updates.foto_url = url;
        } else {
          toast.error('La foto de perfil no se pudo subir — el campista fue creado sin ella.');
        }
      }

      if (files.fotoDocFile) {
        const url = await subirFotoDocumento(personaId, files.fotoDocFile);
        if (url) {
          updates.foto_documento_url = url;
        } else {
          toast.error('La foto del documento no se pudo subir — el campista fue creado sin ella.');
        }
      }

      // Paso 3: actualizar persona con las URLs de las fotos
      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('personas')
          .update(updates)
          .eq('id', personaId);

        if (updateError) {
          console.error('[NuevoCampista] update fotos error:', updateError.message, updateError);
          toast.error(`Las fotos no se pudieron vincular: ${updateError.message}`);
          // No fatal — la persona ya existe
        }
      }

      toast.success('✅ ¡Campista registrado correctamente!');
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error inesperado';
      console.error('[NuevoCampista] unexpected error:', msg, err);
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/personas"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a campistas
        </Link>
        <h1 className="font-montserrat font-bold text-2xl">Nuevo campista</h1>
        <p className="text-muted-foreground text-sm mt-1">Registra un nuevo campista en el Bosque</p>
      </div>
      <PersonaForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
