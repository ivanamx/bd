const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8765;

// Middleware
app.use(cors());
app.use(express.json());

// Middleware de logging para debug
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  console.log(`📤 Headers:`, req.headers);
  console.log(`📤 Body:`, req.body);
  next();
});

// Rutas
try {
  const catalystsRoutes = require('./routes/catalysts');
  const encountersRoutes = require('./routes/encounters');
  const scheduledEncountersRoutes = require('./routes/scheduledEncounters');
  const aiAnalysisRoutes = require('./routes/aiAnalysis');

  app.use('/api/catalysts', catalystsRoutes);
  app.use('/api/encounters', encountersRoutes);
  app.use('/api/scheduled-encounters', scheduledEncountersRoutes);
  app.use('/api/ai-analysis', aiAnalysisRoutes);
  
  console.log('✅ Rutas cargadas correctamente');
} catch (error) {
  console.error('❌ Error cargando rutas:', error);
}

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'Lorei Encounters API',
    version: '1.0.0',
    endpoints: {
      catalysts: '/api/catalysts',
      encounters: '/api/encounters',
      scheduledEncounters: '/api/scheduled-encounters',
      aiAnalysis: '/api/ai-analysis'
    }
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  console.error(`❌ Ruta no encontrada: ${req.method} ${req.path}`);
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('❌ Error en servidor:', err.stack);
  res.status(500).json({ error: 'Algo salió mal!', details: err.message });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📡 API disponible en http://localhost:${PORT}/api`);
  console.log(`🌐 También accesible desde la red local en http://192.168.0.10:${PORT}/api`);
});

