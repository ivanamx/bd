// Configuración de la API
// IMPORTANTE: Cuando usas Expo con --tunnel, necesitas exponer el backend también
// Opción 1: Usa localtunnel (recomendado) - ejecuta: cd backend && npm run tunnel
// Opción 2: Usa ngrok - ejecuta: ngrok http 5000
// Luego actualiza la URL de abajo con la URL pública que te dé el tunnel

// URL del backend - Cloudflare Tunnel
const API_BASE_URL = __DEV__ 
  ? 'https://reasonably-sister-asset-concept.trycloudflare.com/api'  // Cloudflare Tunnel
  : 'http://192.168.0.10:8765/api';  // Para producción

/**
 * Función auxiliar para hacer peticiones HTTP
 */
const fetchAPI = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    console.log(`🔄 Haciendo petición a: ${url}`);
    if (config.body) {
      console.log(`📤 Datos enviados:`, typeof config.body === 'string' ? config.body : JSON.stringify(config.body));
    }
    
    const response = await fetch(url, config);
    
    console.log(`📥 Respuesta recibida: ${response.status} ${response.statusText}`);
    
    // Leer el texto de la respuesta
    const responseText = await response.text();
    console.log(`📄 Contenido de la respuesta (primeros 200 chars):`, responseText.substring(0, 200));
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        // Si no es JSON, usar el texto como error
        errorData = { error: responseText || `Error ${response.status}: ${response.statusText}` };
      }
      console.error(`❌ Error en respuesta:`, errorData);
      const errorMessage = errorData.error || errorData.details || `Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    // Parsear la respuesta JSON
    try {
      const data = JSON.parse(responseText);
      console.log(`✅ Datos parseados exitosamente`);
      return data;
    } catch (e) {
      console.error(`❌ Error parseando JSON:`, e);
      console.error(`❌ Respuesta completa:`, responseText);
      throw new Error(`Respuesta inválida del servidor: ${responseText.substring(0, 100)}`);
    }
  } catch (error) {
    console.error(`❌ Error completo en ${endpoint}:`, error);
    console.error(`❌ URL: ${url}`);
    console.error(`❌ Tipo de error:`, error.name);
    console.error(`❌ Mensaje:`, error.message);
    throw error;
  }
};

// ==================== CATALIZADORES ====================

/**
 * Obtener todos los catalizadores
 */
export const getCatalysts = async () => {
  return fetchAPI('/catalysts');
};

/**
 * Crear un nuevo catalizador
 */
export const createCatalyst = async (catalystData) => {
  return fetchAPI('/catalysts', {
    method: 'POST',
    body: catalystData,
  });
};

// ==================== ENCUENTROS ====================

/**
 * Obtener todos los encuentros
 */
export const getEncounters = async () => {
  return fetchAPI('/encounters');
};

/**
 * Obtener un encuentro por ID
 */
export const getEncounterById = async (encounterId) => {
  return fetchAPI(`/encounters/${encounterId}`);
};

/**
 * Crear un nuevo encuentro
 */
export const createEncounter = async (encounterData) => {
  return fetchAPI('/encounters', {
    method: 'POST',
    body: encounterData,
  });
};

// ==================== ENCUENTROS PROGRAMADOS ====================

/**
 * Obtener todos los encuentros programados
 */
export const getScheduledEncounters = async () => {
  return fetchAPI('/scheduled-encounters');
};

/**
 * Crear un nuevo encuentro programado
 */
export const createScheduledEncounter = async (scheduledData) => {
  return fetchAPI('/scheduled-encounters', {
    method: 'POST',
    body: scheduledData,
  });
};

