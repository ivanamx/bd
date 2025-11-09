# Comandos SQL para Migración de Datos a Sistema Multi-Usuario

## Paso 1: Agregar columna user_id a las tablas existentes

```sql
-- Conectarse a la base de datos
\c lorei_encounters;

-- Agregar user_id a la tabla catalysts
ALTER TABLE catalysts 
ADD COLUMN user_id INT REFERENCES users(user_id) ON DELETE CASCADE;

-- Agregar user_id a la tabla encounters
ALTER TABLE encounters 
ADD COLUMN user_id INT REFERENCES users(user_id) ON DELETE CASCADE;

-- Agregar user_id a la tabla scheduled_encounters
ALTER TABLE scheduled_encounters 
ADD COLUMN user_id INT REFERENCES users(user_id) ON DELETE CASCADE;

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_catalysts_user_id ON catalysts(user_id);
CREATE INDEX idx_encounters_user_id ON encounters(user_id);
CREATE INDEX idx_scheduled_encounters_user_id ON scheduled_encounters(user_id);
```

## Paso 2: Opciones para migrar datos existentes

### Opción A: Asignar todos los datos existentes al primer usuario que se registre

**IMPORTANTE:** Ejecuta esto DESPUÉS de que te registres por primera vez. Reemplaza `TU_USER_ID` con el ID de tu usuario (puedes obtenerlo con: `SELECT user_id FROM users WHERE email = 'tu-email@ejemplo.com';`)

```sql
-- Reemplaza TU_USER_ID con tu user_id real
UPDATE catalysts SET user_id = TU_USER_ID WHERE user_id IS NULL;
UPDATE encounters SET user_id = TU_USER_ID WHERE user_id IS NULL;
UPDATE scheduled_encounters SET user_id = TU_USER_ID WHERE user_id IS NULL;
```

### Opción B: Borrar todos los datos existentes y empezar de cero

```sql
-- CUIDADO: Esto borra TODOS los datos existentes
DELETE FROM scheduled_encounters;
DELETE FROM encounters;
DELETE FROM catalysts;
```

## Paso 3: Hacer user_id NOT NULL (después de migrar datos)

```sql
-- Solo ejecuta esto DESPUÉS de haber asignado user_id a todos los registros existentes
ALTER TABLE catalysts ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE encounters ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE scheduled_encounters ALTER COLUMN user_id SET NOT NULL;
```

## Paso 4: Actualizar constraint de UNIQUE en catalysts

Como ahora cada usuario puede tener sus propios catalysts, el alias debe ser único por usuario, no globalmente:

```sql
-- Eliminar el constraint único actual
ALTER TABLE catalysts DROP CONSTRAINT catalysts_alias_key;

-- Crear un constraint único compuesto (user_id, alias)
CREATE UNIQUE INDEX idx_catalysts_user_alias ON catalysts(user_id, alias);
```

## Resumen del proceso recomendado:

1. **Ejecuta Paso 1** (agregar columnas user_id)
2. **Regístrate en la app** para crear tu usuario
3. **Obtén tu user_id**: `SELECT user_id FROM users WHERE email = 'tu-email@ejemplo.com';`
4. **Ejecuta Opción A del Paso 2** (asignar datos existentes a tu usuario) - O si prefieres empezar de cero, ejecuta Opción B
5. **Ejecuta Paso 3** (hacer user_id NOT NULL)
6. **Ejecuta Paso 4** (actualizar constraint de alias)

