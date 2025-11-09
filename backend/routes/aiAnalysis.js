const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Función para obtener estadísticas de un catalizador
async function getCatalystStats(catalystId) {
  const statsQuery = `
    SELECT 
      COUNT(*) as total_encuentros,
      COALESCE(AVG(rating_general), 0) as rating_promedio,
      COALESCE(AVG(duracion_min), 0) as duracion_promedio,
      MAX(fecha_encuentro) as ultimo_encuentro,
      MIN(fecha_encuentro) as primer_encuentro
    FROM encounters
    WHERE catalyst_id = $1
  `;
  const statsResult = await pool.query(statsQuery, [catalystId]);
  return statsResult.rows[0];
}

// Función para obtener posiciones más usadas
async function getTopPosiciones(catalystId) {
  const posicionesQuery = `
    SELECT 
      posiciones,
      COUNT(*) as veces
    FROM encounters
    WHERE catalyst_id = $1 AND posiciones IS NOT NULL AND posiciones != ''
    GROUP BY posiciones
    ORDER BY veces DESC
    LIMIT 5
  `;
  const result = await pool.query(posicionesQuery, [catalystId]);
  
  // Parsear posiciones (pueden ser arrays o strings separados por comas)
  return result.rows.map(row => {
    const posiciones = row.posiciones.split(',').map(p => p.trim());
    return {
      posiciones: posiciones,
      veces: parseInt(row.veces)
    };
  });
}

// Función para obtener lugares más frecuentes
async function getLugaresFrecuentes(catalystId) {
  const lugaresQuery = `
    SELECT 
      lugar_encuentro,
      COUNT(*) as veces
    FROM encounters
    WHERE catalyst_id = $1 AND lugar_encuentro IS NOT NULL AND lugar_encuentro != ''
    GROUP BY lugar_encuentro
    ORDER BY veces DESC
    LIMIT 5
  `;
  const result = await pool.query(lugaresQuery, [catalystId]);
  return result.rows.map(row => ({
    nombre: row.lugar_encuentro,
    veces: parseInt(row.veces)
  }));
}

// Función para obtener historial de encuentros
async function getEncounterHistory(catalystId, limit = 10) {
  const historyQuery = `
    SELECT 
      e.*,
      c.alias
    FROM encounters e
    JOIN catalysts c ON e.catalyst_id = c.catalyst_id
    WHERE e.catalyst_id = $1
    ORDER BY e.fecha_encuentro DESC
    LIMIT $2
  `;
  const result = await pool.query(historyQuery, [catalystId, limit]);
  return result.rows;
}

// Función para obtener estadísticas generales (todos los tops)
async function getAllStats() {
  const statsQuery = `
    SELECT 
      COUNT(*) as total_encuentros,
      COALESCE(AVG(rating_general), 0) as rating_promedio,
      COALESCE(AVG(duracion_min), 0) as duracion_promedio,
      MAX(fecha_encuentro) as ultimo_encuentro,
      MIN(fecha_encuentro) as primer_encuentro
    FROM encounters
  `;
  const statsResult = await pool.query(statsQuery);
  return statsResult.rows[0];
}

// Función para obtener posiciones más usadas (todos los tops)
async function getAllTopPosiciones() {
  const posicionesQuery = `
    SELECT 
      posiciones,
      COUNT(*) as veces
    FROM encounters
    WHERE posiciones IS NOT NULL AND posiciones != ''
    GROUP BY posiciones
    ORDER BY veces DESC
    LIMIT 5
  `;
  const result = await pool.query(posicionesQuery);
  
  return result.rows.map(row => {
    const posiciones = row.posiciones.split(',').map(p => p.trim());
    return {
      posiciones: posiciones,
      veces: parseInt(row.veces)
    };
  });
}

// Función para obtener lugares más frecuentes (todos los tops)
async function getAllLugaresFrecuentes() {
  const lugaresQuery = `
    SELECT 
      lugar_encuentro,
      COUNT(*) as veces
    FROM encounters
    WHERE lugar_encuentro IS NOT NULL AND lugar_encuentro != ''
    GROUP BY lugar_encuentro
    ORDER BY veces DESC
    LIMIT 5
  `;
  const result = await pool.query(lugaresQuery);
  return result.rows.map(row => ({
    nombre: row.lugar_encuentro,
    veces: parseInt(row.veces)
  }));
}

// Función para obtener historial de encuentros (todos los tops)
async function getAllEncounterHistory(limit = 10) {
  const historyQuery = `
    SELECT 
      e.*,
      c.alias
    FROM encounters e
    JOIN catalysts c ON e.catalyst_id = c.catalyst_id
    ORDER BY e.fecha_encuentro DESC
    LIMIT $1
  `;
  const result = await pool.query(historyQuery, [limit]);
  return result.rows;
}

// Función para generar análisis básico (sin IA externa)
function generateBasicAnalysis(stats, topPosiciones, lugaresFrecuentes, history) {
  // Calcular posiciones individuales más usadas
  const posicionesCount = {};
  topPosiciones.forEach(item => {
    item.posiciones.forEach(pos => {
      posicionesCount[pos] = (posicionesCount[pos] || 0) + item.veces;
    });
  });
  
  const topPosicionesList = Object.entries(posicionesCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([nombre, veces]) => ({ nombre, veces }));

  // Generar sugerencias basadas en patrones
  const lugarMasFrecuente = lugaresFrecuentes[0]?.nombre || 'Hotel';
  const posicionMasUsada = topPosicionesList[0]?.nombre || 'Misionero';
  
  // Calcular próxima fecha sugerida (basada en frecuencia promedio)
  let fechaSugerida = new Date();
  if (stats.total_encuentros > 0 && stats.ultimo_encuentro) {
    const ultimoEncuentro = new Date(stats.ultimo_encuentro);
    const primerEncuentro = new Date(stats.primer_encuentro);
    const diasEntreEncuentros = (ultimoEncuentro - primerEncuentro) / (stats.total_encuentros - 1);
    fechaSugerida = new Date(ultimoEncuentro.getTime() + diasEntreEncuentros);
    // Si la fecha sugerida es en el pasado, agregar 7 días
    if (fechaSugerida < new Date()) {
      fechaSugerida = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
  } else {
    // Si no hay encuentros previos, sugerir en 3 días
    fechaSugerida = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  }

  const duracionSugerida = Math.round(stats.duracion_promedio) || 60;

  // Generar insights
  const insights = [];
  if (stats.total_encuentros > 0) {
    insights.push(`Has tenido ${stats.total_encuentros} encuentro${stats.total_encuentros > 1 ? 's' : ''} con este Top.`);
    
    if (stats.rating_promedio > 7) {
      insights.push(`Tu rating promedio es ${parseFloat(stats.rating_promedio).toFixed(1)}/10 - ¡Excelente!`);
    } else if (stats.rating_promedio > 5) {
      insights.push(`Tu rating promedio es ${parseFloat(stats.rating_promedio).toFixed(1)}/10.`);
    }
    
    if (lugaresFrecuentes.length > 0) {
      insights.push(`Tu lugar favorito es "${lugarMasFrecuente}" (usado ${lugaresFrecuentes[0]?.veces} veces).`);
    }
    if (topPosicionesList.length > 0) {
      insights.push(`Tu posición favorita es "${posicionMasUsada}" (usada ${topPosicionesList[0]?.veces} veces).`);
    }

    // Intentar obtener la mejor combinación (encuentro con mejor rating)
    const mejorEncuentro = history.find(e => parseFloat(e.rating_general) >= 8);
    if (mejorEncuentro) {
      insights.push(`Tu mejor encuentro fue con rating ${parseFloat(mejorEncuentro.rating_general).toFixed(1)}/10.`);
    }
  } else {
    insights.push('Este es tu primer encuentro con este Top. ¡Disfruta la experiencia!');
  }

  const suggestionSummary = stats.total_encuentros > 0
    ? `Basado en tu historial de ${stats.total_encuentros} encuentro${stats.total_encuentros !== 1 ? 's' : ''}, aquí tienes recomendaciones personalizadas.`
    : 'Como es tu primer encuentro con este Top, aquí tienes algunas sugerencias iniciales.';

  const recomendaciones = stats.total_encuentros > 0
    ? `Basado en tus encuentros previos, te recomendamos probar "${posicionMasUsada}" en "${lugarMasFrecuente}" por aproximadamente ${duracionSugerida} minutos.`
    : `Para tu primer encuentro, te sugerimos comenzar con "${posicionMasUsada}" en "${lugarMasFrecuente}" por aproximadamente ${duracionSugerida} minutos.`;

  // Generar escenario detallado basado en el lugar
  const escenarios = {
    'Hotel': {
      ambiente: 'Ambiente elegante y privado',
      iluminacion: 'Luz tenue con velas o iluminación ambiental suave',
      musica: 'Música suave de fondo o silencio íntimo',
      detalles: 'Aprovecha las comodidades del hotel: ducha juntos antes, usa las toallas suaves, disfruta del espacio amplio',
    },
    'Mi casa': {
      ambiente: 'Ambiente familiar y cómodo',
      iluminacion: 'Control total de la iluminación - puedes crear el ambiente perfecto',
      musica: 'Tu playlist favorita o música que ambos disfruten',
      detalles: 'Ventaja de tener todo a mano: lubricante, juguetes, ropa de cama limpia. Puedes preparar el ambiente con anticipación',
    },
    'Su casa': {
      ambiente: 'Ambiente íntimo y personal',
      iluminacion: 'Pregunta sus preferencias o sugiere luz tenue',
      musica: 'Música que ambos disfruten, o déjale elegir',
      detalles: 'Respeta su espacio, pero no dudes en sugerir mejoras. Lleva tus elementos esenciales si es necesario',
    },
    'Coche': {
      ambiente: 'Ambiente espontáneo y excitante',
      iluminacion: 'Oscuridad o luz de la calle filtrada',
      musica: 'Música del auto o silencio para mayor discreción',
      detalles: 'Asegúrate de tener espacio suficiente. Busca un lugar seguro y discreto. Considera el clima y la temperatura',
    },
    'Motel': {
      ambiente: 'Ambiente privado y sin distracciones',
      iluminacion: 'Luz ambiental del motel, generalmente suave',
      musica: 'Música del ambiente o lleva tu propia música',
      detalles: 'Privacidad total. Aprovecha el ambiente diseñado para la intimidad. Usa todas las comodidades disponibles',
    },
  };

  const escenarioDetallado = escenarios[lugarMasFrecuente] || escenarios['Hotel'];

  // Generar recomendaciones de bottoming basadas en posiciones y historial
  const bottomingTips = {
    'Misionero': [
      'Usa una almohada debajo de tus caderas para mejor ángulo y comodidad',
      'Relaja completamente los músculos, especialmente los glúteos',
      'Respira profundamente durante la penetración inicial',
      'Comunica tu ritmo y preferencias claramente',
      'Disfruta del contacto visual y la intimidad de esta posición',
    ],
    'Perrito': [
      'Arquea la espalda suavemente para mejor acceso',
      'Mantén las rodillas cómodamente separadas',
      'Usa lubricante generosamente',
      'Relaja el cuello y los hombros',
      'Esta posición permite mayor profundidad - comunica tus límites',
    ],
    'Cowgirl': [
      'Tú controlas el ritmo y la profundidad',
      'Comienza lento y aumenta gradualmente',
      'Usa tus muslos para controlar el movimiento',
      'Puedes inclinarte hacia adelante o hacia atrás para variar',
      'Disfruta del control y la sensación de poder',
    ],
    'Cowgirl inversa': [
      'Excelente para estimulación de la próstata',
      'Controla el ritmo con tus caderas',
      'Mantén el equilibrio usando tus manos',
      'Puedes variar el ángulo moviendo tu cuerpo',
      'Comunica si necesitas ajustar la posición',
    ],
    'Cucharita': [
      'Posición íntima y cómoda',
      'Perfecta para sesiones más largas',
      'Permite contacto corporal completo',
      'Ideal para comenzar o terminar',
      'Disfruta de la cercanía y el calor corporal',
    ],
    'De pie': [
      'Requiere buena comunicación y equilibrio',
      'Usa una pared o superficie para apoyo',
      'Puede ser más intenso - comunica tus límites',
      'Ideal para encuentros más espontáneos',
      'Asegúrate de tener buena lubricación',
    ],
  };

  const tipsBottoming = bottomingTips[posicionMasUsada] || [
    'Relaja completamente tu cuerpo',
    'Comunica tus preferencias y límites',
    'Usa lubricante generosamente',
    'Respira profundamente',
    'Disfruta del momento presente',
  ];

  return {
    suggestion: {
      summary: suggestionSummary,
      fecha_encuentro: fechaSugerida.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      lugar_encuentro: lugarMasFrecuente,
      posiciones: posicionMasUsada ? [posicionMasUsada] : [],
      duracion_min: duracionSugerida,
      recomendaciones: recomendaciones,
      escenario: escenarioDetallado,
      bottomingTips: tipsBottoming,
    },
    patterns: {
      topPosiciones: topPosicionesList,
      lugaresFrecuentes: lugaresFrecuentes,
      estadisticas: {
        ratingPromedio: parseFloat(stats.rating_promedio),
        duracionPromedio: Math.round(stats.duracion_promedio),
        totalEncuentros: parseInt(stats.total_encuentros),
      },
    },
    insights: insights,
  };
}

// Función para llamar a API de IA (Google Gemini)
async function callAIService(analysisData, formData) {
  // Verificar si hay API key configurada
  if (!process.env.GOOGLE_AI_API_KEY) {
    console.log('⚠️ GOOGLE_AI_API_KEY no configurada, usando análisis básico');
    return null;
  }

  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: process.env.GOOGLE_AI_MODEL || 'gemini-pro' 
    });

    // Preparar historial detallado de encuentros pasados
    const isGeneralAnalysis = analysisData.catalyst?.alias === 'Todos los Tops';
    const historialDetallado = analysisData.history.map((enc, idx) => {
      const topInfo = isGeneralAnalysis ? `- Top: ${enc.alias || 'No especificado'}\n` : '';
      return `Encuentro ${idx + 1} (${new Date(enc.fecha_encuentro).toLocaleDateString('es-ES')}):
${topInfo}- Lugar: ${enc.lugar_encuentro || 'No especificado'}
- Posiciones: ${enc.posiciones || 'No especificadas'}
- Ropa/Lencería: ${enc.ropa || 'No especificada'}
- Duración: ${enc.duracion_min} minutos
- Rating: ${enc.rating_general}/10
- Scores: Intensidad ${enc.score_toma_ruda}/10, Exposición ${enc.score_acento_ancla}/10, Inmersión ${enc.score_compart}/10
- Oral (mío): ${enc.score_oral_mio}/10, Oral (suyo): ${enc.score_oral_suyo}/10
- Final: ${enc.final || 'No especificado'}
- Notas: ${enc.notas_detalladas || 'Sin notas'}`;
    }).join('\n\n');

    // Preparar información del catalizador
    const catalystInfo = analysisData.catalyst ? (
      analysisData.catalyst.alias === 'Todos los Tops' 
        ? `
ANÁLISIS GENERAL - TODOS LOS TOPS:
Este es un análisis basado en los últimos 10 encuentros de TODOS tus tops, no de uno específico.
- Total de encuentros analizados: ${analysisData.stats.total_encuentros}
- Rating promedio general: ${parseFloat(analysisData.stats.rating_promedio).toFixed(1)}/10`
        : `
Información del Top:
- Alias: ${analysisData.catalyst.alias}
- Cuerpo: ${analysisData.catalyst.cuerpo || 'No especificado'}
- Cara: ${analysisData.catalyst.cara || 'No especificado'}
- Edad: ${analysisData.catalyst.edad || 'No especificada'}
- Rating promedio histórico: ${analysisData.catalyst.rating_promedio || analysisData.stats.rating_promedio}/10`
    ) : '';

    const prompt = `Eres un experto consultor íntimo que analiza profundamente historiales de encuentros para crear sugerencias ÚNICAS, PERSONALIZADAS y VARIADAS. Cada análisis debe ser completamente diferente al anterior, incluso con los mismos datos.

${catalystInfo}

ESTADÍSTICAS GENERALES:
- Total de encuentros registrados: ${analysisData.stats.total_encuentros}
- Rating promedio: ${parseFloat(analysisData.stats.rating_promedio).toFixed(1)}/10
- Duración promedio: ${Math.round(analysisData.stats.duracion_promedio)} minutos
- Posiciones más frecuentes: ${analysisData.topPosiciones.map(p => `${p.posiciones.join(', ')} (${p.veces} veces)`).join('; ')}
- Lugares más frecuentes: ${analysisData.lugaresFrecuentes.map(l => `${l.nombre} (${l.veces} veces)`).join(', ')}

HISTORIAL DETALLADO DE ENCUENTROS PASADOS (últimos ${analysisData.history.length}):
${historialDetallado || 'No hay encuentros previos registrados'}

DATOS DEL FORMULARIO ACTUAL (si aplica):
${JSON.stringify(formData, null, 2)}

INSTRUCCIONES CRÍTICAS PARA GENERAR CONTENIDO ÚNICO:
1. VARIEDAD OBLIGATORIA: Cada respuesta debe ser completamente diferente. NO repitas frases, estructuras o sugerencias de análisis anteriores.
2. PERSONALIZACIÓN PROFUNDA: Analiza los patrones específicos del historial (qué funcionó mejor, qué no, tendencias, preferencias emergentes).
3. CREATIVIDAD: Sugiere combinaciones nuevas, variaciones de lo que ya funcionó, y experimentos basados en el historial.
4. ESCENARIO ÚNICO: Crea descripciones de ambiente específicas y detalladas, diferentes cada vez. Incluye detalles sensoriales (olores, texturas, temperatura, sonidos).
5. BOTTOMING TIPS PERSONALIZADOS: Basa los consejos en los scores históricos (si score_oral_suyo es bajo, sugiere mejoras; si score_compart es alto, enfócate en eso).

Proporciona un análisis ÚNICO y PERSONALIZADO en formato JSON con esta estructura exacta:
{
  "suggestion": {
    "summary": "Un resumen único y personalizado basado en el análisis profundo del historial. Debe ser diferente cada vez.",
    "fecha_encuentro": "Fecha sugerida en formato: 'día de mes de año, HH:MM' (ej: '15 de marzo de 2024, 20:30')",
    "lugar_encuentro": "Lugar recomendado (puede ser uno frecuente o una variación nueva)",
    "posiciones": ["posición 1", "posición 2 (opcional)"],
    "ropa": "Sugerencia específica de ropa/lencería basada en el historial",
    "duracion_min": número_entero,
    "recomendaciones": "Recomendaciones detalladas y únicas basadas en patrones del historial",
    "escenario": {
      "ambiente": "Descripción única y detallada del ambiente, diferente cada vez. Incluye detalles sensoriales específicos.",
      "iluminacion": "Recomendaciones creativas y variadas de iluminación, específicas para este encuentro",
      "musica": "Sugerencias musicales personalizadas y variadas (géneros, artistas, playlists, o silencio)",
      "detalles": "Detalles adicionales únicos del escenario: temperatura, aromas, texturas, elementos decorativos, etc."
    },
    "bottomingTips": [
      "Consejo 1 personalizado basado en scores históricos",
      "Consejo 2 específico para mejorar aspectos débiles o potenciar fortalezas",
      "Consejo 3 técnico y detallado",
      "Consejo 4 sobre comunicación y conexión",
      "Consejo 5 sobre preparación física y mental"
    ]
  },
    "patterns": {
      "topPosiciones": [array de objetos con estructura: {"nombre": "string", "veces": número}],
      "lugaresFrecuentes": [array de objetos con estructura: {"nombre": "string", "veces": número}],
      "estadisticas": {
        "ratingPromedio": ${parseFloat(analysisData.stats.rating_promedio).toFixed(1)},
        "duracionPromedio": ${Math.round(analysisData.stats.duracion_promedio)},
        "totalEncuentros": ${analysisData.stats.total_encuentros}
      }
    },
  "insights": [
    "Insight único 1 basado en análisis profundo del historial",
    "Insight único 2 sobre patrones o tendencias descubiertas",
    "Insight único 3 con recomendación específica"
  ]
}

RECUERDA: Esta respuesta debe ser COMPLETAMENTE DIFERENTE a cualquier análisis anterior. Varía el estilo, las sugerencias y los detalles.

IMPORTANTE: Responde SOLO con el JSON, sin texto adicional antes o después. El JSON debe ser válido y parseable.`;

    const systemInstruction = "Eres un consultor íntimo experto y discreto. Analizas historiales de encuentros para crear sugerencias únicas, personalizadas y variadas. Cada respuesta debe ser completamente diferente, creativa y basada en análisis profundo de datos. Eres profesional, respetuoso y detallado. Siempre responde en formato JSON válido.";

    // Combinar instrucción del sistema con el prompt
    const fullPrompt = `${systemInstruction}\n\n${prompt}`;

    const result = await model.generateContent({
      contents: [{ 
        parts: [{ text: fullPrompt }] 
      }],
      generationConfig: {
        temperature: 0.9, // Para más creatividad y variedad
        topP: 0.95, // Para más diversidad en las respuestas
        topK: 40,
        maxOutputTokens: 3000, // Para análisis detallados
      },
    });

    const response = await result.response;
    const responseText = response.text();
    console.log('🤖 Respuesta de IA recibida (primeros 500 chars):', responseText.substring(0, 500));
    
    // Intentar parsear JSON de la respuesta
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ Análisis de IA parseado correctamente');
      return parsed;
    }
    console.log('⚠️ No se pudo extraer JSON de la respuesta');
    return null;
  } catch (error) {
    console.error('❌ Error calling Google Gemini:', error.message);
    // Si es error de API key o modelo, retornar null para usar análisis básico
    if (error.message.includes('API key') || error.message.includes('API_KEY') || error.message.includes('model')) {
      console.log('⚠️ Error de configuración de IA, usando análisis básico');
    }
    return null;
  }
}

// GET /api/ai-analysis/:catalystId - Obtener análisis de IA
router.get('/:catalystId', async (req, res) => {
  try {
    const { catalystId } = req.params;
    let formData = {};
    try {
      if (req.query.formData) {
        formData = JSON.parse(decodeURIComponent(req.query.formData));
      }
    } catch (e) {
      console.log('Error parsing formData, using empty object:', e);
      formData = {};
    }

    let stats, topPosiciones, lugaresFrecuentes, history, catalyst;

    // Si catalystId es "all", obtener estadísticas generales
    if (catalystId === 'all') {
      stats = await getAllStats();
      topPosiciones = await getAllTopPosiciones();
      lugaresFrecuentes = await getAllLugaresFrecuentes();
      history = await getAllEncounterHistory(10);
      catalyst = {
        alias: 'Todos los Tops',
        catalyst_id: null,
      };
    } else {
      // Obtener datos del catalizador específico
      const catalystQuery = 'SELECT * FROM catalysts WHERE catalyst_id = $1';
      const catalystResult = await pool.query(catalystQuery, [catalystId]);
      
      if (catalystResult.rows.length === 0) {
        return res.status(404).json({ error: 'Catalizador no encontrado' });
      }

      catalyst = catalystResult.rows[0];

      // Obtener estadísticas
      stats = await getCatalystStats(catalystId);
      topPosiciones = await getTopPosiciones(catalystId);
      lugaresFrecuentes = await getLugaresFrecuentes(catalystId);
      history = await getEncounterHistory(catalystId, 10);
    }

    // Preparar datos para análisis
    const analysisData = {
      stats,
      topPosiciones,
      lugaresFrecuentes,
      history,
      catalyst,
    };

    // Intentar obtener análisis de IA
    let aiAnalysis = await callAIService(analysisData, formData);

    // Si no hay análisis de IA, usar análisis básico
    if (!aiAnalysis) {
      aiAnalysis = generateBasicAnalysis(stats, topPosiciones, lugaresFrecuentes, history);
    }

    res.json(aiAnalysis);
  } catch (error) {
    console.error('Error generating AI analysis:', error);
    res.status(500).json({ error: 'Error al generar análisis de IA' });
  }
});

module.exports = router;

