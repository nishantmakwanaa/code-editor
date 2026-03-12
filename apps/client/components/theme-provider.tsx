/**
 * Theme provider component that enables dark/light mode support.
 * Features:
 * - System theme detection
 * - Theme persistence
 * - Theme switching
 *
 * By Nishant Makwana (https://nishantmakwanaa.lovable.app)
 */

'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes/dist/types';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
