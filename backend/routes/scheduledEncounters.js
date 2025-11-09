const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET /api/scheduled-encounters - Obtener todos los encuentros programados (no completados)
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const query = `
      SELECT 
        se.*,
        c.alias
      FROM scheduled_encounters se
      JOIN catalysts c ON se.catalyst_id = c.catalyst_id
      WHERE se.user_id = $1 AND c.user_id = $1 AND se.completado = false
      ORDER BY se.fecha_encuentro ASC
    `;
    const result = await pool.query(query, [userId]);
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

    const userId = req.user.userId;
    
    // Verificar que el catalyst pertenece al usuario
    const catalystCheckQuery = 'SELECT catalyst_id FROM catalysts WHERE catalyst_id = $1 AND user_id = $2';
    const catalystCheck = await pool.query(catalystCheckQuery, [catalyst_id, userId]);
    
    if (catalystCheck.rows.length === 0) {
      return res.status(403).json({ error: 'No tienes permiso para usar este catalizador' });
    }

    const query = `
      INSERT INTO scheduled_encounters (user_id, catalyst_id, fecha_encuentro, lugar_encuentro, notas)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      userId,
      catalyst_id, 
      fecha_encuentro, 
      lugar_encuentro || null, 
      notas || null
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
    console.error('Error creating scheduled encounter:', error);
    res.status(500).json({ error: 'Error al crear encuentro programado' });
  }
});

// PUT /api/scheduled-encounters/:id - Actualizar encuentro programado
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { catalyst_id, fecha_encuentro, lugar_encuentro, notas } = req.body;

    // Verificar que el encuentro programado existe y pertenece al usuario
    const checkQuery = 'SELECT scheduled_encounter_id FROM scheduled_encounters WHERE scheduled_encounter_id = $1 AND user_id = $2';
    const checkResult = await pool.query(checkQuery, [id, userId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Encuentro programado no encontrado' });
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
      UPDATE scheduled_encounters SET
        catalyst_id = COALESCE($3, catalyst_id),
        fecha_encuentro = COALESCE($4, fecha_encuentro),
        lugar_encuentro = COALESCE($5, lugar_encuentro),
        notas = COALESCE($6, notas)
      WHERE scheduled_encounter_id = $1 AND user_id = $2
      RETURNING *
    `;

    const values = [id, userId, catalyst_id || null, fecha_encuentro || null, lugar_encuentro || null, notas || null];
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
    console.error('Error updating scheduled encounter:', error);
    res.status(500).json({ error: 'Error al actualizar encuentro programado' });
  }
});

// PATCH /api/scheduled-encounters/:id/complete - Marcar encuentro programado como completado
router.patch('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Verificar que el encuentro programado existe y pertenece al usuario
    const checkQuery = 'SELECT * FROM scheduled_encounters WHERE scheduled_encounter_id = $1 AND user_id = $2';
    const checkResult = await pool.query(checkQuery, [id, userId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Encuentro programado no encontrado' });
    }

    if (checkResult.rows[0].completado) {
      return res.status(400).json({ error: 'El encuentro ya está marcado como completado' });
    }

    const updateQuery = `
      UPDATE scheduled_encounters 
      SET completado = true
      WHERE scheduled_encounter_id = $1 AND user_id = $2
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [id, userId]);

    // Obtener el alias del catalizador
    const catalystId = result.rows[0].catalyst_id;
    const catalystQuery = 'SELECT alias FROM catalysts WHERE catalyst_id = $1 AND user_id = $2';
    const catalystResult = await pool.query(catalystQuery, [catalystId, userId]);

    res.json({
      ...result.rows[0],
      alias: catalystResult.rows[0]?.alias || null
    });
  } catch (error) {
    console.error('Error completing scheduled encounter:', error);
    res.status(500).json({ error: 'Error al marcar encuentro como completado' });
  }
});

// DELETE /api/scheduled-encounters/:id - Eliminar encuentro programado
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Verificar que el encuentro programado existe y pertenece al usuario
    const checkQuery = 'SELECT scheduled_encounter_id FROM scheduled_encounters WHERE scheduled_encounter_id = $1 AND user_id = $2';
    const checkResult = await pool.query(checkQuery, [id, userId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Encuentro programado no encontrado' });
    }

    const deleteQuery = 'DELETE FROM scheduled_encounters WHERE scheduled_encounter_id = $1 AND user_id = $2';
    await pool.query(deleteQuery, [id, userId]);

    res.json({ message: 'Encuentro programado eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting scheduled encounter:', error);
    res.status(500).json({ error: 'Error al eliminar encuentro programado' });
  }
});

module.exports = router;

