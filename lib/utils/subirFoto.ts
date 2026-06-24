import { supabase } from '@/lib/supabase/client';

export async function subirFotoBosque(userId: string, file: File): Promise<string | null> {
  const ext = file.name.split('.').pop() ?? 'png';
  const path = `logos-bosques/${userId}-logo.${ext}`;
  const { data, error } = await supabase.storage
    .from('logos-bosques')
    .upload(path, file, { upsert: true });
  if (error) { console.error('[subirFotoBosque]', error.message); return null; }
  console.log('[subirFotoBosque]', data);
  const { data: { publicUrl } } = supabase.storage.from('logos-bosques').getPublicUrl(path);
  return publicUrl;
}

export async function subirFotoPerfil(personaId: string, file: File): Promise<string | null> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `fotos-perfil/${personaId}-perfil.${ext}`;

  console.log('[subirFotoPerfil] Subiendo a bucket: fotos-perfil, path:', path);

  const { data, error } = await supabase.storage
    .from('fotos-perfil')
    .upload(path, file, { upsert: true });

  console.log('[subirFotoPerfil] Respuesta Supabase:', data, error);

  if (error) {
    console.error('[subirFotoPerfil]', error.message, error);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage.from('fotos-perfil').getPublicUrl(path);
  console.log('[subirFotoPerfil] URL pública:', publicUrl);
  return publicUrl;
}

export async function subirFotoDocumento(personaId: string, file: File): Promise<string | null> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `documentos/${personaId}-documento.${ext}`;

  console.log('[subirFotoDocumento] Subiendo a bucket: documentos, path:', path);

  const { data, error } = await supabase.storage
    .from('documentos')
    .upload(path, file, { upsert: true });

  console.log('[subirFotoDocumento] Respuesta Supabase:', data, error);

  if (error) {
    console.error('[subirFotoDocumento]', error.message, error);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage.from('documentos').getPublicUrl(path);
  console.log('[subirFotoDocumento] URL pública:', publicUrl);
  return publicUrl;
}
