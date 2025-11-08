# Backend API - Lorei Encounters

Backend Node.js/Express con PostgreSQL para la aplicación Lorei Encounters.

## Instalación

1. **Instalar dependencias:**
```bash
cd backend
npm install
```

2. **Configurar variables de entorno:**
   - Copia el archivo `.env.example` a `.env`
   - Edita `.env` con tus credenciales de PostgreSQL:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lorei_encounters
DB_USER=postgres
DB_PASSWORD=tu_contraseña
PORT=5000
```

3. **Asegúrate de que PostgreSQL esté corriendo y que la base de datos `lorei_encounters` exista**

4. **Iniciar el servidor:**
```bash
npm start
```

Para desarrollo con auto-reload:
```bash
npm run dev
```

## Endpoints

### Catalizadores
- `GET /api/catalysts` - Obtener todos los catalizadores
- `POST /api/catalysts` - Crear nuevo catalizador

### Encuentros
- `GET /api/encounters` - Obtener todos los encuentros
- `GET /api/encounters/:id` - Obtener encuentro específico
- `POST /api/encounters` - Crear nuevo encuentro

### Encuentros Programados
- `GET /api/scheduled-encounters` - Obtener todos los encuentros programados
- `POST /api/scheduled-encounters` - Crear nuevo encuentro programado

## Estructura

```
backend/
├── config/
│   └── database.js       # Configuración de PostgreSQL
├── routes/
│   ├── catalysts.js       # Rutas de catalizadores
│   ├── encounters.js      # Rutas de encuentros
│   └── scheduledEncounters.js  # Rutas de encuentros programados
├── server.js              # Servidor principal
├── package.json
└── .env                   # Variables de entorno (crear desde .env.example)
```

## Notas

- El servidor corre en el puerto 5000 por defecto
- Asegúrate de que el puerto 5000 esté disponible
- Si cambias el puerto, actualiza también `src/services/api.js` en el frontend

