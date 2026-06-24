-- Migración 003: Configuración de Storage buckets y políticas de acceso
-- Ejecutar en Supabase SQL Editor o via CLI: supabase db push

-- Crear buckets públicos (ON CONFLICT DO NOTHING es idempotente)
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('fotos-perfil',  'fotos-perfil',  true),
  ('documentos',    'documentos',    true),
  ('logos-bosques', 'logos-bosques', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas para fotos-perfil
DROP POLICY IF EXISTS "allow_all_fotos_perfil" ON storage.objects;
CREATE POLICY "allow_all_fotos_perfil"
  ON storage.objects FOR ALL
  USING  (bucket_id = 'fotos-perfil')
  WITH CHECK (bucket_id = 'fotos-perfil');

-- Políticas para documentos
DROP POLICY IF EXISTS "allow_all_documentos" ON storage.objects;
CREATE POLICY "allow_all_documentos"
  ON storage.objects FOR ALL
  USING  (bucket_id = 'documentos')
  WITH CHECK (bucket_id = 'documentos');

-- Políticas para logos-bosques
DROP POLICY IF EXISTS "allow_all_logos_bosques" ON storage.objects;
CREATE POLICY "allow_all_logos_bosques"
  ON storage.objects FOR ALL
  USING  (bucket_id = 'logos-bosques')
  WITH CHECK (bucket_id = 'logos-bosques');
