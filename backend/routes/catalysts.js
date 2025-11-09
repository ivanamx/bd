const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET /api/catalysts - Obtener todos los catalizadores con rating promedio calculado
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const query = `
      SELECT 
        c.*,
        COALESCE(AVG(e.rating_general), 0) as rating_promedio_calculado
      FROM catalysts c
      LEFT JOIN encounters e ON c.catalyst_id = e.catalyst_id AND e.user_id = $1
      WHERE c.user_id = $1
      GROUP BY c.catalyst_id
      ORDER BY c.fecha_registro DESC
    `;
    const result = await pool.query(query, [userId]);
    
    // Convertir el rating_promedio_calculado a número y reemplazar el rating_promedio
    const catalysts = result.rows.map(cat => ({
      ...cat,
      rating_promedio: parseFloat(cat.rating_promedio_calculado || 0).toFixed(1)
    }));
    
    res.json(catalysts);
  } catch (error) {
    console.error('Error fetching catalysts:', error);
    res.status(500).json({ error: 'Error al obtener tops' });
  }
});

// POST /api/catalysts - Crear nuevo catalizador
router.post('/', async (req, res) => {
  try {
    const { alias, cuerpo, cara, edad } = req.body;
    
    console.log('📥 Recibida petición para crear catalizador:', { alias, cuerpo, cara, edad });
    
    if (!alias) {
      return res.status(400).json({ error: 'El alias es requerido' });
    }

    const userId = req.user.userId;
    const query = `
      INSERT INTO catalysts (user_id, alias, cuerpo, cara, edad)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [userId, alias, cuerpo || null, cara || null, edad || null];
    console.log('🔍 Ejecutando query con valores:', values);
    
    const result = await pool.query(query, values);
    console.log('✅ Catalizador creado exitosamente:', result.rows[0]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creating catalyst:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      detail: error.detail
    });
    if (error.code === '23505') { // Violación de unique constraint
      res.status(400).json({ error: 'El alias ya existe' });
    } else {
      res.status(500).json({ 
        error: 'Error al crear catalizador',
        details: error.message 
      });
    }
  }
});

// PUT /api/catalysts/:id - Actualizar catalizador
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { alias, cuerpo, cara, edad } = req.body;

    // Verificar que el catalizador existe y pertenece al usuario
    const checkQuery = 'SELECT catalyst_id FROM catalysts WHERE catalyst_id = $1 AND user_id = $2';
    const checkResult = await pool.query(checkQuery, [id, userId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Catalizador no encontrado' });
    }

    // Si se cambia el alias, verificar que no existe otro con el mismo alias
    if (alias) {
      const aliasCheckQuery = 'SELECT catalyst_id FROM catalysts WHERE alias = $1 AND user_id = $2 AND catalyst_id != $3';
      const aliasCheck = await pool.query(aliasCheckQuery, [alias, userId, id]);
      
      if (aliasCheck.rows.length > 0) {
        return res.status(400).json({ error: 'El alias ya existe' });
      }
    }

    const updateQuery = `
      UPDATE catalysts SET
        alias = COALESCE($3, alias),
        cuerpo = COALESCE($4, cuerpo),
        cara = COALESCE($5, cara),
        edad = COALESCE($6, edad)
      WHERE catalyst_id = $1 AND user_id = $2
      RETURNING *
    `;

    const values = [id, userId, alias || null, cuerpo || null, cara || null, edad || null];
    const result = await pool.query(updateQuery, values);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating catalyst:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'El alias ya existe' });
    } else {
      res.status(500).json({ error: 'Error al actualizar catalizador' });
    }
  }
});

// DELETE /api/catalysts/:id - Eliminar catalizador
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Verificar que el catalizador existe y pertenece al usuario
    const checkQuery = 'SELECT catalyst_id FROM catalysts WHERE catalyst_id = $1 AND user_id = $2';
    const checkResult = await pool.query(checkQuery, [id, userId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Catalizador no encontrado' });
    }

    // Eliminar el catalizador (los encuentros se eliminarán en cascada por ON DELETE CASCADE)
    const deleteQuery = 'DELETE FROM catalysts WHERE catalyst_id = $1 AND user_id = $2';
    await pool.query(deleteQuery, [id, userId]);

    res.json({ message: 'Catalizador eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting catalyst:', error);
    res.status(500).json({ error: 'Error al eliminar catalizador' });
  }
});

module.exports = router;

