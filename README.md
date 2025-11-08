# Lorei Encounters - React Native App

Aplicación móvil React Native para iPhone diseñada para el registro y calificación de encuentros personales. Desarrollada con Expo, incluye dark mode y un diseño elegante y femenino.

## Características

- 📱 Diseñada específicamente para iOS (iPhone)
- 🌙 Dark mode elegante con paleta de colores femenina
- 📝 Registro completo de encuentros con múltiples calificaciones
- 👥 Gestión de catalizadores
- 📊 Visualización detallada de encuentros pasados
- 🎨 Interfaz intuitiva y moderna

## Requisitos Previos

- Node.js (v16 o superior)
- npm o yarn
- Expo CLI (`npm install -g expo-cli`)
- iPhone físico o simulador de iOS
- Xcode (para desarrollo iOS nativo)

## Instalación

1. Instala las dependencias:
```bash
npm install
```

2. Inicia el servidor de desarrollo:
```bash
npm start
```

3. Para ejecutar en iPhone:
   - Escanea el código QR con la app Expo Go en tu iPhone
   - O ejecuta `npm run ios` si tienes Xcode configurado

## Configuración de la API

La aplicación está configurada para conectarse a una API backend. Por defecto, en modo desarrollo apunta a:
- `http://localhost:5000/api`

Para cambiar el puerto de la API, edita el archivo `src/services/api.js`:

```javascript
const API_PORT = 5000; // Cambia este número al puerto que uses
```

Para cambiar completamente la URL de la API (producción), modifica:

```javascript
const API_BASE_URL = __DEV__ 
  ? `http://localhost:${API_PORT}/api` 
  : 'https://tu-api-url.com/api';
```

## Estructura del Proyecto

```
├── App.js                 # Componente principal
├── src/
│   ├── components/        # Componentes reutilizables
│   │   ├── RatingSlider.js
│   │   └── PickerSelect.js
│   ├── context/          # Contextos de React
│   │   └── ThemeContext.js
│   ├── navigation/       # Configuración de navegación
│   │   └── MainNavigator.js
│   ├── screens/          # Pantallas de la aplicación
│   │   ├── EncountersListScreen.js
│   │   ├── NewEncounterScreen.js
│   │   ├── EncounterDetailScreen.js
│   │   └── CatalystsScreen.js
│   └── services/         # Servicios y APIs
│       └── api.js
└── package.json
```

## Pantallas

### Lista de Encuentros
Muestra todos los encuentros registrados ordenados por fecha, con el rating general y el alias del catalizador.

### Nuevo Encuentro
Formulario completo para registrar un nuevo encuentro con:
- Selección de catalizador
- Fecha y hora
- Duración
- Detalles físicos (tamaño, condón, posiciones, etc.)
- Calificaciones (Toma Ruda, Acento Ancla, Compartimentalización, Rating General)
- Notas detalladas

### Detalles del Encuentro
Vista detallada de un encuentro específico con toda la información registrada.

### Catalizadores
Gestión de catalizadores: visualización y creación de nuevos.

## Esquema de Base de Datos

La aplicación espera una API que maneje las siguientes tablas:

### Tabla: catalysts
- catalyst_id (SERIAL PRIMARY KEY)
- alias (VARCHAR(255) UNIQUE)
- rating_promedio (DECIMAL(3,1))
- notas_generales (TEXT)
- fecha_registro (TIMESTAMP)

### Tabla: encounters
- encounter_id (SERIAL PRIMARY KEY)
- catalyst_id (INT FOREIGN KEY)
- fecha_encuentro (TIMESTAMP)
- duracion_min (INT)
- lugar_encuentro (TEXT)
- tamano (VARCHAR(20))
- condon (VARCHAR(50))
- posiciones (TEXT)
- final (TEXT)
- ropa (TEXT)
- score_toma_ruda (INT 1-10)
- score_acento_ancla (INT 1-10)
- score_compart (INT 1-10)
- rating_general (DECIMAL(3,1) 0.0-10.0)
- notas_detalladas (TEXT)

## Endpoints de API Requeridos

- `GET /api/catalysts` - Obtener todos los catalizadores
- `POST /api/catalysts` - Crear nuevo catalizador
- `GET /api/encounters` - Obtener todos los encuentros
- `GET /api/encounters/:id` - Obtener encuentro específico
- `POST /api/encounters` - Crear nuevo encuentro

## Tema y Diseño

La aplicación utiliza un tema dark mode con:
- Colores primarios en tonos rosados/púrpuras elegantes
- Tipografía clara y legible
- Espaciado generoso
- Bordes redondeados
- Sombras sutiles

## Desarrollo

Para desarrollo en iOS:
```bash
npm run ios
```

Para desarrollo en Android:
```bash
npm run android
```

## Licencia

Privado - Uso personal

