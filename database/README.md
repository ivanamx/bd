# Scripts de Base de Datos PostgreSQL

## Instrucciones de Instalación

### Opción 1: Usando psql (Línea de comandos)

1. Abre una terminal y conéctate a PostgreSQL:
```bash
psql -U postgres
```

2. Ejecuta el script completo:
```bash
\i database/schema.sql
```

O copia y pega los comandos del archivo `schema.sql` directamente en psql.

### Opción 2: Ejecutar comandos individualmente

1. Conéctate a PostgreSQL:
```bash
psql -U postgres
```

2. Crea la base de datos:
```sql
CREATE DATABASE lorei_encounters;
```

3. Conéctate a la nueva base de datos:
```sql
\c lorei_encounters;
```

4. Ejecuta los comandos CREATE TABLE del archivo `schema.sql`

### Opción 3: Desde archivo SQL

```bash
psql -U postgres -f database/schema.sql
```

## Verificar la Instalación

Después de ejecutar los comandos, verifica que las tablas se crearon correctamente:

```sql
\c lorei_encounters;
\dt
```

Deberías ver las tablas `catalysts` y `encounters`.

Para ver la estructura de una tabla:
```sql
\d catalysts
\d encounters
```

## Notas

- Asegúrate de tener PostgreSQL instalado y corriendo
- Reemplaza `postgres` con tu usuario de PostgreSQL si es diferente
- Si necesitas cambiar el nombre de la base de datos, modifica `lorei_encounters` en el script

