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

module.exports = router;

