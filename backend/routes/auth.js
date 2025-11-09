const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// POST /api/auth/register - Registrar nuevo usuario
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    // Validar contraseña (mínimo 8 caracteres)
    if (password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    // Verificar si el usuario ya existe
    const checkUserQuery = 'SELECT user_id FROM users WHERE email = $1';
    const checkUserResult = await pool.query(checkUserQuery, [email.toLowerCase()]);

    if (checkUserResult.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Encriptar contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Crear usuario
    const insertUserQuery = `
      INSERT INTO users (email, password_hash, created_at)
      VALUES ($1, $2, NOW())
      RETURNING user_id, email, created_at
    `;
    const insertResult = await pool.query(insertUserQuery, [
      email.toLowerCase(),
      passwordHash,
    ]);

    const user = insertResult.rows[0];

    // Generar tokens
    const accessToken = jwt.sign(
      { userId: user.user_id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.user_id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Guardar refresh token en la base de datos
    const updateRefreshTokenQuery = `
      UPDATE users 
      SET refresh_token = $1, refresh_token_expires_at = NOW() + INTERVAL '7 days'
      WHERE user_id = $2
    `;
    await pool.query(updateRefreshTokenQuery, [refreshToken, user.user_id]);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        userId: user.user_id,
        email: user.email,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// POST /api/auth/login - Iniciar sesión
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Buscar usuario
    const userQuery = 'SELECT user_id, email, password_hash FROM users WHERE email = $1';
    const userResult = await pool.query(userQuery, [email.toLowerCase()]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    const user = userResult.rows[0];

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    // Generar tokens
    const accessToken = jwt.sign(
      { userId: user.user_id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.user_id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Guardar refresh token en la base de datos
    const updateRefreshTokenQuery = `
      UPDATE users 
      SET refresh_token = $1, refresh_token_expires_at = NOW() + INTERVAL '7 days', last_login = NOW()
      WHERE user_id = $2
    `;
    await pool.query(updateRefreshTokenQuery, [refreshToken, user.user_id]);

    res.json({
      message: 'Login exitoso',
      user: {
        userId: user.user_id,
        email: user.email,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// POST /api/auth/refresh - Renovar token de acceso
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token requerido' });
    }

    // Verificar refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      return res.status(401).json({ error: 'Refresh token inválido o expirado' });
    }

    // Verificar que el refresh token existe en la base de datos y no ha expirado
    const userQuery = `
      SELECT user_id, email 
      FROM users 
      WHERE user_id = $1 
        AND refresh_token = $2 
        AND refresh_token_expires_at > NOW()
    `;
    const userResult = await pool.query(userQuery, [decoded.userId, refreshToken]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Refresh token inválido o expirado' });
    }

    const user = userResult.rows[0];

    // Generar nuevo access token
    const accessToken = jwt.sign(
      { userId: user.user_id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({
      accessToken,
    });
  } catch (error) {
    console.error('Error al renovar token:', error);
    res.status(500).json({ error: 'Error al renovar token' });
  }
});

// POST /api/auth/logout - Cerrar sesión
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Eliminar refresh token de la base de datos
        const clearRefreshTokenQuery = `
          UPDATE users 
          SET refresh_token = NULL, refresh_token_expires_at = NULL
          WHERE user_id = $1
        `;
        await pool.query(clearRefreshTokenQuery, [decoded.userId]);
      } catch (error) {
        // Si el token es inválido, no importa, solo limpiamos
      }
    }

    res.json({ message: 'Sesión cerrada exitosamente' });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ error: 'Error al cerrar sesión' });
  }
});

// GET /api/auth/me - Obtener información del usuario actual
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token requerido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const userQuery = 'SELECT user_id, email, created_at FROM users WHERE user_id = $1';
    const userResult = await pool.query(userQuery, [decoded.userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      user: {
        userId: userResult.rows[0].user_id,
        email: userResult.rows[0].email,
        createdAt: userResult.rows[0].created_at,
      },
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error al obtener información del usuario' });
  }
});

module.exports = router;

