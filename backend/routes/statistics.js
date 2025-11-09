const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET /api/statistics - Obtener todas las estadísticas generales
router.get('/', async (req, res) => {
  try {
    // Estadísticas generales
    const generalStatsQuery = `
      SELECT 
        COUNT(*) as total_encuentros,
        COALESCE(AVG(rating_general), 0) as rating_promedio,
        COUNT(DISTINCT catalyst_id) as total_tops,
        COALESCE(AVG(duracion_min), 0) as duracion_promedio,
        MAX(fecha_encuentro) as ultimo_encuentro,
        MIN(fecha_encuentro) as primer_encuentro
      FROM encounters
    `;
    const generalStats = await pool.query(generalStatsQuery);
    
    // Encuentros este mes
    const thisMonthQuery = `
      SELECT COUNT(*) as encuentros_este_mes
      FROM encounters
      WHERE DATE_TRUNC('month', fecha_encuentro) = DATE_TRUNC('month', CURRENT_DATE)
    `;
    const thisMonth = await pool.query(thisMonthQuery);
    
    // Distribución de ratings
    const ratingDistributionQuery = `
      SELECT 
        CASE 
          WHEN rating_general >= 9 THEN '9-10'
          WHEN rating_general >= 7 THEN '7-8'
          WHEN rating_general >= 4 THEN '4-6'
          ELSE '1-3'
        END as rango,
        COUNT(*) as cantidad
      FROM encounters
      WHERE rating_general IS NOT NULL
      GROUP BY rango
      ORDER BY rango DESC
    `;
    const ratingDistribution = await pool.query(ratingDistributionQuery);
    
    // Top 5 Tops más frecuentes
    const topTopsQuery = `
      SELECT 
        c.catalyst_id,
        c.alias,
        COUNT(e.encounter_id) as total_encuentros,
        COALESCE(AVG(e.rating_general), 0) as rating_promedio
      FROM catalysts c
      LEFT JOIN encounters e ON c.catalyst_id = e.catalyst_id
      GROUP BY c.catalyst_id, c.alias
      HAVING COUNT(e.encounter_id) > 0
      ORDER BY total_encuentros DESC
      LIMIT 5
    `;
    const topTops = await pool.query(topTopsQuery);
    
    // Lugares más frecuentes
    const topLugaresQuery = `
      SELECT 
        lugar,
        COUNT(*) as veces
      FROM encounters
      WHERE lugar IS NOT NULL AND lugar != ''
      GROUP BY lugar
      ORDER BY veces DESC
      LIMIT 5
    `;
    const topLugares = await pool.query(topLugaresQuery);
    
    // Posiciones más comunes
    const topPosicionesQuery = `
      SELECT 
        posiciones,
        COUNT(*) as veces
      FROM encounters
      WHERE posiciones IS NOT NULL AND posiciones != ''
      GROUP BY posiciones
      ORDER BY veces DESC
      LIMIT 5
    `;
    const topPosiciones = await pool.query(topPosicionesQuery);
    
    // Actividad mensual (últimos 12 meses)
    const monthlyActivityQuery = `
      SELECT 
        TO_CHAR(fecha_encuentro, 'YYYY-MM') as mes,
        COUNT(*) as cantidad
      FROM encounters
      WHERE fecha_encuentro >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY mes
      ORDER BY mes DESC
      LIMIT 12
    `;
    const monthlyActivity = await pool.query(monthlyActivityQuery);
    
    // Mejor encuentro (rating más alto)
    const bestEncounterQuery = `
      SELECT 
        e.encounter_id,
        e.rating_general,
        e.fecha_encuentro,
        c.alias
      FROM encounters e
      LEFT JOIN catalysts c ON e.catalyst_id = c.catalyst_id
      WHERE e.rating_general IS NOT NULL
      ORDER BY e.rating_general DESC, e.fecha_encuentro DESC
      LIMIT 1
    `;
    const bestEncounter = await pool.query(bestEncounterQuery);
    
    // Estadísticas de encuentros programados
    const scheduledStatsQuery = `
      SELECT 
        COUNT(*) as total_programados,
        COUNT(*) FILTER (WHERE completado = true) as completados,
        COUNT(*) FILTER (WHERE completado = false AND fecha_encuentro < CURRENT_DATE) as vencidos
      FROM scheduled_encounters
    `;
    const scheduledStats = await pool.query(scheduledStatsQuery);
    
    // Rating promedio por top (top 10)
    const ratingByTopQuery = `
      SELECT 
        c.catalyst_id,
        c.alias,
        COALESCE(AVG(e.rating_general), 0) as rating_promedio,
        COUNT(e.encounter_id) as total_encuentros
      FROM catalysts c
      LEFT JOIN encounters e ON c.catalyst_id = e.catalyst_id
      GROUP BY c.catalyst_id, c.alias
      HAVING COUNT(e.encounter_id) > 0
      ORDER BY rating_promedio DESC
      LIMIT 10
    `;
    const ratingByTop = await pool.query(ratingByTopQuery);
    
    res.json({
      general: {
        total_encuentros: parseInt(generalStats.rows[0].total_encuentros),
        rating_promedio: parseFloat(generalStats.rows[0].rating_promedio).toFixed(1),
        total_tops: parseInt(generalStats.rows[0].total_tops),
        duracion_promedio: parseFloat(generalStats.rows[0].duracion_promedio).toFixed(0),
        encuentros_este_mes: parseInt(thisMonth.rows[0].encuentros_este_mes),
        ultimo_encuentro: generalStats.rows[0].ultimo_encuentro,
        primer_encuentro: generalStats.rows[0].primer_encuentro,
      },
      ratingDistribution: ratingDistribution.rows.map(r => ({
        rango: r.rango,
        cantidad: parseInt(r.cantidad),
      })),
      topTops: topTops.rows.map(t => ({
        catalyst_id: t.catalyst_id,
        alias: t.alias,
        total_encuentros: parseInt(t.total_encuentros),
        rating_promedio: parseFloat(t.rating_promedio).toFixed(1),
      })),
      topLugares: topLugares.rows.map(l => ({
        lugar: l.lugar,
        veces: parseInt(l.veces),
      })),
      topPosiciones: topPosiciones.rows.map(p => ({
        posiciones: p.posiciones,
        veces: parseInt(p.veces),
      })),
      monthlyActivity: monthlyActivity.rows.map(m => ({
        mes: m.mes,
        cantidad: parseInt(m.cantidad),
      })),
      bestEncounter: bestEncounter.rows.length > 0 ? {
        encounter_id: bestEncounter.rows[0].encounter_id,
        rating: parseFloat(bestEncounter.rows[0].rating_general).toFixed(1),
        fecha: bestEncounter.rows[0].fecha_encuentro,
        alias: bestEncounter.rows[0].alias,
      } : null,
      scheduled: {
        total_programados: parseInt(scheduledStats.rows[0].total_programados),
        completados: parseInt(scheduledStats.rows[0].completados),
        vencidos: parseInt(scheduledStats.rows[0].vencidos),
      },
      ratingByTop: ratingByTop.rows.map(r => ({
        catalyst_id: r.catalyst_id,
        alias: r.alias,
        rating_promedio: parseFloat(r.rating_promedio).toFixed(1),
        total_encuentros: parseInt(r.total_encuentros),
      })),
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

module.exports = router;

