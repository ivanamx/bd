// Script para verificar que la base de datos tenga las columnas correctas
const pool = require('./config/database');

async function checkDatabase() {
  try {
    console.log('🔍 Verificando estructura de la base de datos...\n');
    
    // Verificar columnas de catalysts
    const catalystsCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'catalysts'
      ORDER BY ordinal_position;
    `);
    
    console.log('📊 Columnas en tabla catalysts:');
    catalystsCheck.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });
    
    const requiredColumns = ['catalyst_id', 'alias', 'cuerpo', 'cara', 'edad', 'rating_promedio', 'fecha_registro'];
    const existingColumns = catalystsCheck.rows.map(r => r.column_name);
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('\n❌ FALTAN COLUMNAS:');
      missingColumns.forEach(col => console.log(`   - ${col}`));
      console.log('\n💡 Ejecuta el script de migración:');
      console.log('   psql -U postgres -d lorei_encounters -f ../database/migration.sql');
    } else {
      console.log('\n✅ Todas las columnas necesarias están presentes');
    }
    
    // Verificar que la tabla existe y tiene datos de prueba
    const testQuery = await pool.query('SELECT COUNT(*) as count FROM catalysts');
    console.log(`\n📈 Total de catalizadores: ${testQuery.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error verificando base de datos:', error);
  } finally {
    await pool.end();
  }
}

checkDatabase();

