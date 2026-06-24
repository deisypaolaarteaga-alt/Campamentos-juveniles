-- PERSONAS
-- PERSONAS
CREATE TABLE personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_completo TEXT NOT NULL,
  documento TEXT UNIQUE NOT NULL,
  tipo_documento TEXT NOT NULL DEFAULT 'CC',
  fecha_nacimiento DATE,
  año_ingreso INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  parentesco TEXT,
  genero TEXT,
  telefono TEXT,
  email TEXT,
  direccion TEXT,
  estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo','inactivo')),
  nivel_formacion TEXT DEFAULT 'campista' CHECK (nivel_formacion IN ('campista','semilla','raiz','tallo','hoja','flor','fruto')),
  habilidades TEXT[],
  profesion TEXT,
  estudios TEXT,
  observaciones TEXT,
  foto_url TEXT,
  notas TEXT,
  campos_dinamicos JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CAMPOS PERSONALIZADOS
CREATE TABLE campos_personalizados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_campo TEXT NOT NULL UNIQUE,
  etiqueta TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'text' CHECK (tipo IN ('text','number','date','select','boolean','textarea')),
  opciones TEXT[],
  obligatorio BOOLEAN DEFAULT false,
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ASISTENCIAS
CREATE TABLE asistencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  estado TEXT NOT NULL CHECK (estado IN ('asistio','no_asistio','excusa','tarde','permiso')),
  observacion TEXT,
  registrado_por TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(persona_id, fecha)
);

-- EVENTOS
CREATE TABLE eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha DATE NOT NULL,
  hora_inicio TIME,
  hora_fin TIME,
  tipo TEXT DEFAULT 'reunion',
  obligatorio BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONFIGURACION
CREATE TABLE configuracion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave TEXT UNIQUE NOT NULL,
  valor JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ÍNDICES (sin DATE_TRUNC)
CREATE INDEX idx_asistencias_persona ON asistencias(persona_id);
CREATE INDEX idx_asistencias_fecha ON asistencias(fecha);
CREATE INDEX idx_personas_estado ON personas(estado);
CREATE INDEX idx_personas_nivel ON personas(nivel_formacion);

-- FUNCIÓN updated_at automático
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_personas
BEFORE UPDATE ON personas
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_asistencias
BEFORE UPDATE ON asistencias
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ROW LEVEL SECURITY
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE campos_personalizados ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_personas" ON personas FOR ALL USING (true);
CREATE POLICY "allow_all_asistencias" ON asistencias FOR ALL USING (true);
CREATE POLICY "allow_all_campos" ON campos_personalizados FOR ALL USING (true);
CREATE POLICY "allow_all_config" ON configuracion FOR ALL USING (true);

-- DATOS SEMILLA
INSERT INTO configuracion (clave, valor) VALUES
('niveles_formacion', '["campista","semilla","raiz","tallo","hoja","flor","fruto"]'),
('colores_estado_asistencia', '{"asistio":"green","no_asistio":"red","excusa":"yellow","tarde":"orange","permiso":"blue"}'),
('nombre_organizacion', '"Mi Organización"');