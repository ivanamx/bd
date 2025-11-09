const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET /api/encounters - Obtener todos los encuentros con alias del catalizador
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const query = `
      SELECT 
        e.*,
        c.alias
      FROM encounters e
      JOIN catalysts c ON e.catalyst_id = c.catalyst_id
      WHERE e.user_id = $1 AND c.user_id = $1
      ORDER BY e.fecha_encuentro DESC
    `;
    const result = await pool.query(query, [userId]);
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
    const userId = req.user.userId;
    const query = `
      SELECT 
        e.*,
        c.alias
      FROM encounters e
      JOIN catalysts c ON e.catalyst_id = c.catalyst_id
      WHERE e.encounter_id = $1 AND e.user_id = $2 AND c.user_id = $2
    `;
    const result = await pool.query(query, [id, userId]);
    
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

    const userId = req.user.userId;
    
    // Verificar que el catalyst pertenece al usuario
    const catalystCheckQuery = 'SELECT catalyst_id FROM catalysts WHERE catalyst_id = $1 AND user_id = $2';
    const catalystCheck = await pool.query(catalystCheckQuery, [catalyst_id, userId]);
    
    if (catalystCheck.rows.length === 0) {
      return res.status(403).json({ error: 'No tienes permiso para usar este catalizador' });
    }

    const query = `
      INSERT INTO encounters (
        user_id, catalyst_id, fecha_encuentro, duracion_min, lugar_encuentro,
        tamano, condon, posiciones, final, ropa,
        score_toma_ruda, score_acento_ancla, score_compart,
        score_oral_mio, score_oral_suyo, rating_general, notas_detalladas
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `;
    
    const values = [
      userId,
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
    const catalystQuery = 'SELECT alias FROM catalysts WHERE catalyst_id = $1 AND user_id = $2';
    const catalystResult = await pool.query(catalystQuery, [catalyst_id, userId]);
    
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

