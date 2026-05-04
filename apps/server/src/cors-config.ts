/**
 * CORS configuration for server request handling.
 * Features:
 * - Origin validation
 * - Vercel deployment detection
 * - Header generation
 *
 * Owned by Nishant Makwana
 */

// Set ALLOWED_ORIGINS env (comma-separated) to add more origins
const ENV_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
      .map(o => o.trim())
      .filter(Boolean)
  : [];

const DEFAULT_ORIGINS = [
  'http://localhost:3000',
  'https://online-collaborative-code-editor.vercel.app'
];

const RENDER_PATTERN = /^https:\/\/[a-zA-Z0-9-]+\.onrender\.com$/;

const ALLOWED_ORIGINS = [...DEFAULT_ORIGINS, ...ENV_ORIGINS] as readonly string[];

const isVercelDeployment = (origin: string): boolean => {
  const VERCEL_PATTERN = /^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/;
  return VERCEL_PATTERN.test(origin);
};

const isRenderDeployment = (origin: string): boolean => {
  return RENDER_PATTERN.test(origin);
};

const getAllowedOrigin = (origin: string | undefined): string => {
  // For security, avoid returning '*' in production
  if (process.env.NODE_ENV === 'production' && !origin) {
    return ALLOWED_ORIGINS[0];
  }

  if (!origin) return '*';

  if (
    ALLOWED_ORIGINS.includes(origin) ||
    isVercelDeployment(origin) ||
    isRenderDeployment(origin)
  ) {
    return origin;
  }

  return ENV_ORIGINS[0] || ALLOWED_ORIGINS[0];
};

const getCorsHeaders = (origin: string | undefined) => ({
  'Access-Control-Allow-Origin': getAllowedOrigin(origin),
  'Access-Control-Allow-Methods': 'GET',
  Vary: 'Origin'
});

export { ALLOWED_ORIGINS, getCorsHeaders, isRenderDeployment, isVercelDeployment };
