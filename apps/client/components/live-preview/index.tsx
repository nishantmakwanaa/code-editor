/**
 * Live preview component that renders HTML with Sandpack.
 * Features:
 * - Real-time preview updates
 * - Tailwind CSS support
 * - Theme-aware rendering
 * - Error handling
 *
 * By Nishant Makwana (https://nishantmakwanaa.lovable.app)
 */

import { SandpackLayout, SandpackPreview, SandpackProvider } from '@codesandbox/sandpack-react';
import { useTheme } from 'next-themes';

import { DISABLE_TAILWIND_CDN_WARN, SANDPACK_CDN } from '@/lib/constants';

import { HelpPopover } from './components/help-popover';

interface LivePreviewProps {
  value: string;
}

const LivePreview = ({ value }: LivePreviewProps) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const isHTML = /^\s*</.test(value) || /<[a-z][\s\S]*>/i.test(value);
  const bodyContent = isHTML ? value : `<script>${value}</script>`;

  return (
    <SandpackProvider
      theme={isDark ? 'dark' : 'light'}
      template="static"
      className="!h-full !bg-[color:var(--panel-background,#111827)]"
      files={{
        'index.html': `<!DOCTYPE html><html class="${isDark ? 'dark' : ''}"><head>${DISABLE_TAILWIND_CDN_WARN}${SANDPACK_CDN}<style>html,body{background-color:${isDark ? '#111827' : '#ffffff'};color:${isDark ? '#f9fafb' : '#111827'};margin:0;padding:8px;font-family:sans-serif;}</style></head><body>${bodyContent}</body></html>`
      }}
      options={{
        initMode: 'user-visible'
      }}
    >
      <SandpackLayout className="!h-full !rounded-none !border-none !bg-[color:var(--panel-background,#111827)]">
        <SandpackPreview
          className="!h-full !bg-[color:var(--panel-background,#111827)]"
          showOpenInCodeSandbox={false}
          showRefreshButton={false}
          showRestartButton={false}
          showNavigator={false}
        />
      </SandpackLayout>
    </SandpackProvider>
  );
};

export { LivePreview };
