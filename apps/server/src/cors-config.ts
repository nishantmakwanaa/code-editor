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

const DEV_DEFAULT_ORIGIN = 'http://localhost:3000';

const RENDER_PATTERN = /^https:\/\/[a-zA-Z0-9-]+\.onrender\.com$/;

const ALLOWED_ORIGINS = (
  ENV_ORIGINS.length > 0
    ? ENV_ORIGINS
    : process.env.NODE_ENV === 'development'
      ? [DEV_DEFAULT_ORIGIN]
      : []
) as readonly string[];

const isVercelDeployment = (origin: string): boolean => {
  const VERCEL_PATTERN = /^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/;
  return VERCEL_PATTERN.test(origin);
};

const isRenderDeployment = (origin: string): boolean => {
  return RENDER_PATTERN.test(origin);
};

const isLocalDevOrigin = (origin: string): boolean =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

const defaultOrigin = (): string => ENV_ORIGINS[0] || ALLOWED_ORIGINS[0] || DEV_DEFAULT_ORIGIN;

const getAllowedOrigin = (origin: string | undefined): string => {
  const isProduction = process.env.NODE_ENV === 'production';

  // For security, avoid returning '*' in production
  if (isProduction && !origin) {
    return defaultOrigin();
  }

  if (!origin) return '*';

  if (
    ALLOWED_ORIGINS.includes(origin) ||
    isVercelDeployment(origin) ||
    isRenderDeployment(origin) ||
    (!isProduction && isLocalDevOrigin(origin))
  ) {
    return origin;
  }

  return defaultOrigin();
};

const getCorsHeaders = (origin: string | undefined) => ({
  'Access-Control-Allow-Origin': getAllowedOrigin(origin),
  'Access-Control-Allow-Methods': 'GET',
  Vary: 'Origin'
});

export { ALLOWED_ORIGINS, getCorsHeaders, isRenderDeployment, isVercelDeployment };
