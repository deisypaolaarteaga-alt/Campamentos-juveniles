'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Camera, FileText, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/**
 * Dos modos de uso:
 *
 * 1. Modo diferido (PersonaForm — fotos de campistas):
 *    Proporciona `onFileChange`. El archivo se guarda localmente y se
 *    sube DESPUÉS de crear/actualizar la persona para poder usar su ID.
 *
 * 2. Modo inmediato (Configuración — logo del bosque):
 *    Proporciona `bucket` + `onFotoChange`. Sube al instante y devuelve
 *    la URL pública.
 */
interface FotoUploadProps {
  fotoUrl?: string;
  nombre?: string;
  variante?: 'circular' | 'rectangular';
  label?: string;
  // Modo diferido
  onFileChange?: (file: File | null) => void;
  // Modo inmediato
  bucket?: string;
  onFotoChange?: (url: string) => void;
}

export function FotoUpload({
  fotoUrl,
  nombre = '',
  variante = 'circular',
  label,
  onFileChange,
  bucket = 'fotos-perfil',
  onFotoChange,
}: FotoUploadProps) {
  const isDeferred = !!onFileChange;

  const [uploading, setUploading] = useState(false);
  const [fileReady, setFileReady] = useState(false);
  const [preview, setPreview] = useState(fotoUrl ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar 5 MB');
      return;
    }

    // Liberar URL de objeto anterior
    if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);

    if (isDeferred) {
      // Modo diferido: mostrar vista previa local, guardar file para más tarde
      const localUrl = URL.createObjectURL(file);
      setPreview(localUrl);
      setFileReady(true);
      onFileChange!(file);
      return;
    }

    // Modo inmediato: subir a Supabase ahora
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error('[FotoUpload] Error al subir archivo:', uploadError.message, uploadError);
        toast.error(`Error al subir: ${uploadError.message}`);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      setPreview(publicUrl);
      onFotoChange?.(publicUrl);
      toast.success('✅ Archivo subido correctamente');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      console.error('[FotoUpload] Error inesperado:', msg, err);
      toast.error(`Error inesperado: ${msg}`);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setPreview('');
    setFileReady(false);
    if (isDeferred) {
      onFileChange!(null);
    } else {
      onFotoChange?.('');
    }
  };

  const statusLabel = uploading
    ? 'Subiendo...'
    : isDeferred && fileReady
      ? 'Foto lista ✓'
      : 'Subir foto';

  if (variante === 'rectangular') {
    return (
      <div className="space-y-2">
        {label && <p className="text-sm font-medium">{label}</p>}
        <div
          className={cn(
            'relative w-full h-32 rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden',
            uploading && 'opacity-60'
          )}
          onClick={() => inputRef.current?.click()}
        >
          {preview ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            preview.startsWith('blob:') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Documento" className="w-full h-full object-contain p-2" />
            ) : (
              <Image src={preview} alt="Documento" fill className="object-contain p-2" />
            )
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <FileText className="w-8 h-8" />
              <span className="text-xs text-center px-2">Haz clic para subir la foto del documento</span>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {isDeferred && fileReady && !uploading && (
            <div className="absolute top-2 right-2 bg-green-500 rounded-full p-0.5">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-accent text-xs disabled:opacity-60"
          >
            <Upload className="w-3.5 h-3.5" />
            {uploading ? 'Subiendo...' : isDeferred && fileReady ? 'Cambiar documento' : 'Subir documento'}
          </button>
          {preview && (
            <button
              type="button"
              onClick={handleRemove}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-accent text-xs text-destructive"
            >
              <X className="w-3.5 h-3.5" />
              Quitar
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={cn(
          'relative w-24 h-24 rounded-full border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden',
          uploading && 'opacity-60'
        )}
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          preview.startsWith('blob:') ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Foto de perfil" className="w-full h-full object-cover" />
          ) : (
            <Image src={preview} alt="Foto de perfil" fill className="object-cover" />
          )
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <Camera className="w-6 h-6" />
            <span className="text-xs">{nombre ? nombre.charAt(0).toUpperCase() : 'Foto'}</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {isDeferred && fileReady && !uploading && (
          <div className="absolute bottom-1 right-1 bg-green-500 rounded-full p-0.5">
            <Check className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-accent text-xs disabled:opacity-60"
        >
          <Upload className="w-3.5 h-3.5" />
          {statusLabel}
        </button>
        {preview && (
          <button
            type="button"
            onClick={handleRemove}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-accent text-xs text-destructive"
          >
            <X className="w-3.5 h-3.5" />
            Quitar
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  );
}
