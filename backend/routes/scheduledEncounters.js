const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET /api/scheduled-encounters - Obtener todos los encuentros programados (no completados)
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        se.*,
        c.alias
      FROM scheduled_encounters se
      JOIN catalysts c ON se.catalyst_id = c.catalyst_id
      WHERE se.completado = false
      ORDER BY se.fecha_encuentro ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching scheduled encounters:', error);
    res.status(500).json({ error: 'Error al obtener encuentros programados' });
  }
});

// POST /api/scheduled-encounters - Crear un nuevo encuentro programado
router.post('/', async (req, res) => {
  try {
    const { catalyst_id, fecha_encuentro, lugar_encuentro, notas } = req.body;
    
    if (!catalyst_id || !fecha_encuentro) {
      return res.status(400).json({ 
        error: 'catalyst_id y fecha_encuentro son requeridos' 
      });
    }

    const query = `
      INSERT INTO scheduled_encounters (catalyst_id, fecha_encuentro, lugar_encuentro, notas)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [
      catalyst_id, 
      fecha_encuentro, 
      lugar_encuentro || null, 
      notas || null
    ];
    const result = await pool.query(query, values);
    
    // Obtener el alias del catalizador
    const catalystQuery = 'SELECT alias FROM catalysts WHERE catalyst_id = $1';
    const catalystResult = await pool.query(catalystQuery, [catalyst_id]);
    
    res.status(201).json({
      ...result.rows[0],
      alias: catalystResult.rows[0]?.alias || null
    });
  } catch (error) {
    console.error('Error creating scheduled encounter:', error);
    res.status(500).json({ error: 'Error al crear encuentro programado' });
  }
});

module.exports = router;

