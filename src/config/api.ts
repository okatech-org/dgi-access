// Configuration API DGI
export const API_CONFIG = {
  USE_API: import.meta.env.VITE_USE_API === 'true' || false,
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  API_KEY: import.meta.env.VITE_API_KEY || 'dev-dgi-key-123',
  APP_TITLE: import.meta.env.VITE_APP_TITLE || 'DGI Access - Gabon',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '2.0.0'
};

// Variables d'environnement par défaut si pas définies
if (typeof window !== 'undefined') {
  console.log('🔧 Configuration API DGI:', {
    useApi: API_CONFIG.USE_API,
    baseUrl: API_CONFIG.BASE_URL,
    version: API_CONFIG.APP_VERSION
  });
}
