// Configuración de la API
// URLs disponibles:
// - Desarrollo local con tunnel: Cloudflare Tunnel
// - Producción: VPS

// Para cambiar entre desarrollo y producción, cambia el valor de USE_PRODUCTION
const USE_PRODUCTION = true; // Cambia a true para usar el VPS

const DEV_URL = 'https://reasonably-sister-asset-concept.trycloudflare.com/api'; // Cloudflare Tunnel (desarrollo)
const PROD_URL = 'https://api.loreastrea.com/api'; // VPS con dominio permanente

const API_BASE_URL = (__DEV__ && !USE_PRODUCTION) 
  ? DEV_URL  // Desarrollo: Cloudflare Tunnel
  : PROD_URL;  // Producción: VPS

// Token de autenticación (se actualiza desde AuthContext)
let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export const clearAuthToken = () => {
  authToken = null;
};

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

  // Agregar token de autenticación si existe
  if (authToken) {
    config.headers['Authorization'] = `Bearer ${authToken}`;
  }

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

// ==================== ANÁLISIS IA ====================

/**
 * Obtener análisis de IA para un catalizador
 * @param {string|number} catalystId - ID del catalizador o 'all' para análisis general
 * @param {object} formData - Datos del formulario (opcional)
 */
export const getAIAnalysis = async (catalystId, formData = {}) => {
  // Codificar formData para evitar problemas con caracteres especiales
  const encodedFormData = encodeURIComponent(JSON.stringify(formData));
  const catalystParam = catalystId === 'all' ? 'all' : catalystId;
  return fetchAPI(`/ai-analysis/${catalystParam}?formData=${encodedFormData}`);
};

// ==================== ESTADÍSTICAS ====================

/**
 * Obtener todas las estadísticas generales
 */
export const getStatistics = async () => {
  return fetchAPI('/statistics');
};

// ==================== AUTENTICACIÓN ====================

/**
 * Registrar nuevo usuario
 */
export const register = async (email, password) => {
  return fetchAPI('/auth/register', {
    method: 'POST',
    body: { email, password },
  });
};

/**
 * Iniciar sesión
 */
export const login = async (email, password) => {
  return fetchAPI('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
};

/**
 * Renovar token de acceso
 */
export const refreshToken = async (refreshToken) => {
  return fetchAPI('/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
  });
};

/**
 * Cerrar sesión
 */
export const logout = async () => {
  try {
    await fetchAPI('/auth/logout', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error en logout:', error);
  } finally {
    clearAuthToken();
  }
};

/**
 * Obtener información del usuario actual
 */
export const getCurrentUser = async () => {
  return fetchAPI('/auth/me');
};

