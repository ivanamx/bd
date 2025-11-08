const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET /api/encounters - Obtener todos los encuentros con alias del catalizador
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        e.*,
        c.alias
      FROM encounters e
      JOIN catalysts c ON e.catalyst_id = c.catalyst_id
      ORDER BY e.fecha_encuentro DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching encounters:', error);
    res.status(500).json({ error: 'Error al obtener encuentros' });
  }
});

// GET /api/encounters/:id - Obtener encuentro específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        e.*,
        c.alias
      FROM encounters e
      JOIN catalysts c ON e.catalyst_id = c.catalyst_id
      WHERE e.encounter_id = $1
    `;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Encuentro no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching encounter:', error);
    res.status(500).json({ error: 'Error al obtener encuentro' });
  }
});

// POST /api/encounters - Crear nuevo encuentro
router.post('/', async (req, res) => {
  try {
    const {
      catalyst_id,
      fecha_encuentro,
      duracion_min,
      lugar_encuentro,
      tamano,
      condon,
      posiciones,
      final,
      ropa,
      score_toma_ruda,
      score_acento_ancla,
      score_compart,
      score_oral_mio,
      score_oral_suyo,
      rating_general,
      notas_detalladas
    } = req.body;
    
    if (!catalyst_id || !fecha_encuentro || !tamano || !condon) {
      return res.status(400).json({ 
        error: 'catalyst_id, fecha_encuentro, tamano y condon son requeridos' 
      });
    }

    const query = `
      INSERT INTO encounters (
        catalyst_id, fecha_encuentro, duracion_min, lugar_encuentro,
        tamano, condon, posiciones, final, ropa,
        score_toma_ruda, score_acento_ancla, score_compart,
        score_oral_mio, score_oral_suyo, rating_general, notas_detalladas
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;
    
    const values = [
      catalyst_id,
      fecha_encuentro,
      duracion_min || 60,
      lugar_encuentro || null,
      tamano,
      condon,
      posiciones || null,
      final || null,
      ropa || null,
      score_toma_ruda || 5,
      score_acento_ancla || 5,
      score_compart || 5,
      score_oral_mio || 5,
      score_oral_suyo || 5,
      rating_general || 5.0,
      notas_detalladas || null
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
    console.error('Error creating encounter:', error);
    res.status(500).json({ error: 'Error al crear encuentro' });
  }
});

module.exports = router;

