const { Pool } = require('pg');
require('dotenv').config();

const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'lorei_encounters',
  user: process.env.DB_USER || 'postgres',
};

// Solo agregar password si existe y no está vacío
if (process.env.DB_PASSWORD && process.env.DB_PASSWORD.trim() !== '') {
  poolConfig.password = process.env.DB_PASSWORD;
}

const pool = new Pool(poolConfig);

// Probar la conexión al iniciar
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error conectando a PostgreSQL:', err.message);
    console.error('Verifica tus credenciales en el archivo .env');
  } else {
    console.log('✅ Conectado a PostgreSQL');
    console.log(`📊 Base de datos: ${process.env.DB_NAME || 'lorei_encounters'}`);
  }
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en PostgreSQL:', err);
  process.exit(-1);
});

module.exports = pool;

