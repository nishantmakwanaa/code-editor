/**
 * Next.js configuration for the client application.
 * Features:
 * - Sentry error tracking
 * - Package optimization
 * - Image domains
 * - Turbo config
 *
 * Owned by Nishant Makwana
 */

import type { NextConfig } from 'next';

import path from 'path';

import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, '../../'),
  reactCompiler: true,
  poweredByHeader: false,
  typedRoutes: true,
  experimental: {
    typedEnv: true,
    turbopackFileSystemCacheForDev: true,
    optimizePackageImports: [
      '@codesandbox/sandpack-react',
      '@mdxeditor/editor',
      '@monaco-editor/react',
      'monaco-editor'
    ],
    externalDir: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**'
      }
    ]
  },
  transpilePackages: ['monaco-themes', '@codex/types'],
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /monaco-themes/,
      resolve: {
        exportsFields: []
      }
    });

    return config;
  }
};

const isCi = process.env.CI === 'true';

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG || 'nishant-makwana',
  project: process.env.SENTRY_PROJECT || 'code-editor',
  silent: !process.env.CI, // Only print logs for uploading source maps in CI
  widenClientFileUpload: true, // Upload a larger set of source maps for prettier stack traces (increases build time)
  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true
  },
  tunnelRoute: '/monitoring', // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // hideSourceMaps: true, // Hides source maps from generated client bundles
  disableLogger: true, // Automatically tree-shake Sentry logger statements to reduce bundle size
  automaticVercelMonitors: true, // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // Automatically upload source maps for all Next.js pages
  sourcemaps: {
    deleteSourcemapsAfterUpload: isCi
  },
  telemetry: !isCi // Disable Sentry telemetry in CI
});
