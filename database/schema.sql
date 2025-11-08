-- Crear la base de datos
CREATE DATABASE lorei_encounters;

-- Conectar a la base de datos
\c lorei_encounters;

-- Tabla 1: catalysts (Catalizadores)
CREATE TABLE catalysts (
    catalyst_id SERIAL PRIMARY KEY,
    alias VARCHAR(255) NOT NULL UNIQUE,
    cuerpo VARCHAR(50),
    cara VARCHAR(50),
    edad VARCHAR(10),
    rating_promedio DECIMAL(3,1) DEFAULT 0.0,
    notas_generales TEXT,
    fecha_registro TIMESTAMP DEFAULT NOW()
);

-- Tabla 2: encounters (Encuentros de Lore)
CREATE TABLE encounters (
    encounter_id SERIAL PRIMARY KEY,
    catalyst_id INT NOT NULL,
    fecha_encuentro TIMESTAMP NOT NULL,
    duracion_min INT NOT NULL,
    lugar_encuentro TEXT,
    tamano VARCHAR(20) NOT NULL,
    condon VARCHAR(50) NOT NULL,
    posiciones TEXT,
    final TEXT,
    ropa TEXT,
    score_toma_ruda INT NOT NULL CHECK (score_toma_ruda >= 1 AND score_toma_ruda <= 10),
    score_acento_ancla INT NOT NULL CHECK (score_acento_ancla >= 1 AND score_acento_ancla <= 10),
    score_compart INT NOT NULL CHECK (score_compart >= 1 AND score_compart <= 10),
    score_oral_mio INT NOT NULL CHECK (score_oral_mio >= 1 AND score_oral_mio <= 10),
    score_oral_suyo INT NOT NULL CHECK (score_oral_suyo >= 1 AND score_oral_suyo <= 10),
    rating_general DECIMAL(3,1) NOT NULL CHECK (rating_general >= 0.0 AND rating_general <= 10.0),
    notas_detalladas TEXT,
    FOREIGN KEY (catalyst_id) REFERENCES catalysts(catalyst_id) ON DELETE CASCADE
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_encounters_catalyst_id ON encounters(catalyst_id);
CREATE INDEX idx_encounters_fecha ON encounters(fecha_encuentro DESC);
CREATE INDEX idx_catalysts_alias ON catalysts(alias);

-- Tabla 3: scheduled_encounters (Encuentros Programados)
CREATE TABLE scheduled_encounters (
    scheduled_encounter_id SERIAL PRIMARY KEY,
    catalyst_id INT NOT NULL,
    fecha_encuentro TIMESTAMP NOT NULL,
    lugar_encuentro TEXT,
    notas TEXT,
    completado BOOLEAN DEFAULT false,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (catalyst_id) REFERENCES catalysts(catalyst_id) ON DELETE CASCADE
);

-- Índices adicionales
CREATE INDEX idx_scheduled_encounters_catalyst_id ON scheduled_encounters(catalyst_id);
CREATE INDEX idx_scheduled_encounters_fecha ON scheduled_encounters(fecha_encuentro ASC);
CREATE INDEX idx_scheduled_encounters_completado ON scheduled_encounters(completado);

-- Comentarios en las tablas (opcional, para documentación)
COMMENT ON TABLE catalysts IS 'Tabla de Catalizadores';
COMMENT ON TABLE encounters IS 'Tabla de Encuentros de Lore';
COMMENT ON TABLE scheduled_encounters IS 'Tabla de Encuentros Programados';

