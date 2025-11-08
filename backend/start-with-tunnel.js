// Script para iniciar el servidor y exponerlo con localtunnel
const localtunnel = require('localtunnel');
const { exec } = require('child_process');

const PORT = process.env.PORT || 8765;

console.log('🚀 Iniciando servidor backend en segundo plano...');

// Iniciar el servidor principal en segundo plano
const server = exec('node server.js', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error}`);
    return;
  }
});

server.stdout.on('data', (data) => {
  console.log(data.toString());
});

server.stderr.on('data', (data) => {
  console.error(data.toString());
});

// Esperar un poco para que el servidor inicie
setTimeout(() => {
  console.log('\n🌐 Creando tunnel público con localtunnel...');
  
  const tunnel = localtunnel(PORT, (err, tunnel) => {
    if (err) {
      console.error('❌ Error creando tunnel:', err);
      console.error('\n💡 Intenta ejecutar manualmente:');
      console.error('   1. En una terminal: cd backend && npm start');
      console.error('   2. En otra terminal: npx localtunnel --port 8765');
      return;
    }
    
    const publicUrl = tunnel.url;
    console.log('\n✅ ============================================');
    console.log('✅ TUNNEL PÚBLICO CREADO EXITOSAMENTE');
    console.log('✅ ============================================');
    console.log(`\n🌐 URL pública del backend: ${publicUrl}`);
    console.log(`\n📱 URL completa de la API: ${publicUrl}/api`);
    console.log(`\n⚠️  IMPORTANTE: Copia esta URL y actualiza src/services/api.js:`);
    console.log(`   const API_BASE_URL = '${publicUrl}/api';`);
    console.log('\n✅ ============================================\n');
    
    tunnel.on('close', () => {
      console.log('❌ Tunnel cerrado');
    });
  });
  
  // Manejar cierre del proceso
  process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando tunnel y servidor...');
    tunnel.close();
    server.kill();
    process.exit();
  });
  
}, 3000);
