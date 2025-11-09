# Lorei Encounters - Landing Page

Landing page moderna, visual y experimental para Lorei Encounters. Diseñada para transmitir seguridad, privacidad y facilitar la descarga directa del APK.

## 🎨 Características

- **Diseño Moderno**: Dark mode elegante que coincide con la app
- **Animaciones Fluidas**: Efectos con Framer Motion
- **Fondo de Partículas**: Sistema de partículas interactivo con conexiones dinámicas
- **Responsive**: Diseño adaptativo para todos los dispositivos
- **Efectos Visuales**: Gradientes animados, glassmorphism, y efectos parallax
- **Sección de Seguridad**: Destaca la privacidad y seguridad de la app
- **Descarga Directa**: Instrucciones claras para descargar e instalar el APK

## 🚀 Instalación

```bash
cd landing
npm install
```

## 💻 Desarrollo

```bash
npm run dev
```

La aplicación se abrirá en `http://localhost:3000`

## 📦 Build para Producción

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `dist/`

## 🎯 Estructura

```
landing/
├── src/
│   ├── components/
│   │   ├── Hero.jsx           # Sección principal con CTA
│   │   ├── Features.jsx       # Características de la app
│   │   ├── Security.jsx        # Seguridad y privacidad
│   │   ├── Download.jsx      # Sección de descarga APK
│   │   ├── Footer.jsx        # Footer
│   │   └── ParticleBackground.jsx  # Fondo de partículas
│   ├── App.jsx               # Componente principal
│   ├── App.css               # Estilos principales
│   ├── main.jsx              # Punto de entrada
│   └── index.css             # Estilos globales
├── index.html
├── package.json
└── vite.config.js
```

## 🎨 Paleta de Colores

- **Background**: `#0f0f0f`
- **Surface**: `#1a1a1a`
- **Primary**: `#d4a5c7` (rosa/púrpura)
- **Primary Light**: `#e8c4dc`
- **Primary Dark**: `#b886a8`
- **Text**: `#f5f5f5`
- **Text Secondary**: `#d0d0d0`

## 📝 Personalización

### Cambiar URL de Descarga del APK

Edita `landing/src/components/Download.jsx` y actualiza el `href` del botón de descarga:

```jsx
<motion.a
  href="TU_URL_DEL_APK_AQUI"
  className="download-button"
  // ...
>
```

### Modificar Contenido

- **Hero**: `src/components/Hero.jsx`
- **Características**: `src/components/Features.jsx`
- **Seguridad**: `src/components/Security.jsx`
- **Descarga**: `src/components/Download.jsx`

## 🌐 Despliegue

### Netlify / Vercel

1. Conecta tu repositorio
2. Configura el build command: `npm run build`
3. Configura el publish directory: `dist`

### Servidor Estático

1. Ejecuta `npm run build`
2. Sube la carpeta `dist/` a tu servidor

## 📱 Optimizaciones

- ✅ Lazy loading de componentes
- ✅ Animaciones optimizadas con Framer Motion
- ✅ CSS optimizado y minificado en producción
- ✅ Imágenes y assets optimizados
- ✅ Scroll suave y navegación fluida

## 🔒 Seguridad

La landing page está diseñada para:
- Transmitir confianza y seguridad
- Explicar claramente por qué la app no está en tiendas
- Proporcionar instrucciones claras para descarga segura
- Destacar el compromiso con la privacidad

## 📄 Licencia

Privado - Uso exclusivo para Lorei Encounters

