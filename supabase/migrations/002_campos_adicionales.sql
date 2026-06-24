-- Migración 002: Campos adicionales para campistas
-- Información médica, emergencias y archivos multimedia

ALTER TABLE personas ADD COLUMN IF NOT EXISTS tipo_sangre TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS eps TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS alergias TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS contacto_emergencia_nombre TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS contacto_emergencia_telefono TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS foto_documento_url TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS logo_bosque_url TEXT;

-- Tabla de configuración del Bosque
CREATE TABLE IF NOT EXISTS bosque (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     TEXT,
  ciudad     TEXT,
  logo_url   TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bosque ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_bosque" ON bosque FOR ALL USING (true) WITH CHECK (true);
