-- Script de migración para actualizar la base de datos existente
-- Ejecuta este script si ya tienes la base de datos creada

-- Conectar a la base de datos
\c lorei_encounters;

-- Agregar columnas faltantes a la tabla catalysts si no existen
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='catalysts' AND column_name='cuerpo') THEN
        ALTER TABLE catalysts ADD COLUMN cuerpo VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='catalysts' AND column_name='cara') THEN
        ALTER TABLE catalysts ADD COLUMN cara VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='catalysts' AND column_name='edad') THEN
        ALTER TABLE catalysts ADD COLUMN edad VARCHAR(10);
    END IF;
END $$;

-- Agregar columnas faltantes a la tabla encounters si no existen
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='encounters' AND column_name='score_oral_mio') THEN
        ALTER TABLE encounters ADD COLUMN score_oral_mio INT NOT NULL DEFAULT 5 
            CHECK (score_oral_mio >= 1 AND score_oral_mio <= 10);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='encounters' AND column_name='score_oral_suyo') THEN
        ALTER TABLE encounters ADD COLUMN score_oral_suyo INT NOT NULL DEFAULT 5 
            CHECK (score_oral_suyo >= 1 AND score_oral_suyo <= 10);
    END IF;
END $$;

-- Crear tabla scheduled_encounters si no existe
CREATE TABLE IF NOT EXISTS scheduled_encounters (
    scheduled_encounter_id SERIAL PRIMARY KEY,
    catalyst_id INT NOT NULL,
    fecha_encuentro TIMESTAMP NOT NULL,
    lugar_encuentro TEXT,
    notas TEXT,
    completado BOOLEAN DEFAULT false,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (catalyst_id) REFERENCES catalysts(catalyst_id) ON DELETE CASCADE
);

-- Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_scheduled_encounters_catalyst_id 
    ON scheduled_encounters(catalyst_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_encounters_fecha 
    ON scheduled_encounters(fecha_encuentro ASC);
CREATE INDEX IF NOT EXISTS idx_scheduled_encounters_completado 
    ON scheduled_encounters(completado);

-- Verificar que todo esté correcto
SELECT 'Migración completada exitosamente' AS status;

