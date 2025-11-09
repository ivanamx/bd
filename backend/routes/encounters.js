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

// PUT /api/encounters/:id - Actualizar encuentro
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
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

    // Verificar que el encuentro existe y pertenece al usuario
    const checkQuery = 'SELECT encounter_id FROM encounters WHERE encounter_id = $1 AND user_id = $2';
    const checkResult = await pool.query(checkQuery, [id, userId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Encuentro no encontrado' });
    }

    // Si se cambia el catalizador, verificar que pertenece al usuario
    if (catalyst_id) {
      const catalystCheckQuery = 'SELECT catalyst_id FROM catalysts WHERE catalyst_id = $1 AND user_id = $2';
      const catalystCheck = await pool.query(catalystCheckQuery, [catalyst_id, userId]);
      
      if (catalystCheck.rows.length === 0) {
        return res.status(403).json({ error: 'No tienes permiso para usar este catalizador' });
      }
    }

    const updateQuery = `
      UPDATE encounters SET
        catalyst_id = COALESCE($3, catalyst_id),
        fecha_encuentro = COALESCE($4, fecha_encuentro),
        duracion_min = COALESCE($5, duracion_min),
        lugar_encuentro = COALESCE($6, lugar_encuentro),
        tamano = COALESCE($7, tamano),
        condon = COALESCE($8, condon),
        posiciones = COALESCE($9, posiciones),
        final = COALESCE($10, final),
        ropa = COALESCE($11, ropa),
        score_toma_ruda = COALESCE($12, score_toma_ruda),
        score_acento_ancla = COALESCE($13, score_acento_ancla),
        score_compart = COALESCE($14, score_compart),
        score_oral_mio = COALESCE($15, score_oral_mio),
        score_oral_suyo = COALESCE($16, score_oral_suyo),
        rating_general = COALESCE($17, rating_general),
        notas_detalladas = COALESCE($18, notas_detalladas)
      WHERE encounter_id = $1 AND user_id = $2
      RETURNING *
    `;

    const values = [
      id,
      userId,
      catalyst_id || null,
      fecha_encuentro || null,
      duracion_min || null,
      lugar_encuentro || null,
      tamano || null,
      condon || null,
      posiciones || null,
      final || null,
      ropa || null,
      score_toma_ruda || null,
      score_acento_ancla || null,
      score_compart || null,
      score_oral_mio || null,
      score_oral_suyo || null,
      rating_general || null,
      notas_detalladas || null
    ];

    const result = await pool.query(updateQuery, values);

    // Obtener el alias del catalizador
    const catalystId = result.rows[0].catalyst_id;
    const catalystQuery = 'SELECT alias FROM catalysts WHERE catalyst_id = $1 AND user_id = $2';
    const catalystResult = await pool.query(catalystQuery, [catalystId, userId]);

    res.json({
      ...result.rows[0],
      alias: catalystResult.rows[0]?.alias || null
    });
  } catch (error) {
    console.error('Error updating encounter:', error);
    res.status(500).json({ error: 'Error al actualizar encuentro' });
  }
});

// DELETE /api/encounters/:id - Eliminar encuentro
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Verificar que el encuentro existe y pertenece al usuario
    const checkQuery = 'SELECT encounter_id FROM encounters WHERE encounter_id = $1 AND user_id = $2';
    const checkResult = await pool.query(checkQuery, [id, userId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Encuentro no encontrado' });
    }

    const deleteQuery = 'DELETE FROM encounters WHERE encounter_id = $1 AND user_id = $2';
    await pool.query(deleteQuery, [id, userId]);

    res.json({ message: 'Encuentro eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting encounter:', error);
    res.status(500).json({ error: 'Error al eliminar encuentro' });
  }
});

module.exports = router;

