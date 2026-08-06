/**
 * Editor theme utility that manages Monaco editor themes.
 * Features:
 * - Theme initialization and persistence
 * - Theme application to editor and UI
 * - CSS variable handling for consistent theming
 * - System/dark mode synchronization
 *
 * By Nishant Makwana (https://nishantmakwanaa.lovable.app)
 */

import type { Monaco } from '@monaco-editor/react';

import { getMonacoThemeData } from '@/lib/monaco-theme-loader';

const DEFAULT_THEMES = {
  'vs-dark': {
    name: 'Dark (Visual Studio)',
    variables: {
      '--toolbar-bg-secondary': '#3c3c3c',
      '--panel-background': '#1e1e1e',
      '--toolbar-foreground': '#fff',
      '--toolbar-bg-primary': '#2678ca',
      '--toolbar-accent': '#2678ca',
      '--panel-text-accent': '#fff'
    }
  },
  light: {
    name: 'Light (Visual Studio)',
    variables: {
      '--toolbar-bg-secondary': '#dddddd',
      '--panel-background': '#fffffe',
      '--toolbar-foreground': '#000',
      '--toolbar-bg-primary': '#2678ca',
      '--toolbar-accent': '#2678ca',
      '--panel-text-accent': '#fff'
    }
  }
};

const setCSSVariables = (variables: Record<string, string>) => {
  if (typeof document === 'undefined') return; // Check for SSR

  const root = document.documentElement;
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};

// Global Monaco instance reference
let globalMonaco: Monaco | null = null;

// Function to register Monaco
export const registerMonaco = (monaco: Monaco) => {
  globalMonaco = monaco;

  // Apply the current theme to Monaco if it exists
  const savedTheme =
    typeof localStorage !== 'undefined' ? localStorage.getItem('editorTheme') : null;
  if (savedTheme && globalMonaco) {
    globalMonaco.editor.setTheme(savedTheme);
  } else if (globalMonaco) {
    // If no saved theme, check system preference
    const systemPrefersDark =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    const defaultTheme = systemPrefersDark ? 'vs-dark' : 'light';
    globalMonaco.editor.setTheme(defaultTheme);
  }
};

// Function to check system preference for dark mode
const getSystemPreference = (): 'dark' | 'light' => {
  if (typeof window === 'undefined') return 'dark'; // Default for SSR

  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

export const initEditorTheme = () => {
  if (typeof window === 'undefined') return; // Skip during SSR

  const savedTheme = localStorage.getItem('editorTheme');

  if (savedTheme) {
    // Apply saved theme variables
    if (savedTheme in DEFAULT_THEMES) {
      // For default themes
      const themeConfig = DEFAULT_THEMES[savedTheme as keyof typeof DEFAULT_THEMES];
      setCSSVariables(themeConfig.variables);
      setCSSVariables({ '--status-bar-text': '#fff' });

      // Set document classes for dark mode
      if (savedTheme === 'vs-dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    } else {
      // For custom themes
      try {
        const themeData = getMonacoThemeData(savedTheme);

        if (themeData) {
          // Set document classes for dark mode
          if (themeData.base === 'vs-dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
          } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
          }

          setCSSVariables({
            '--toolbar-bg-primary':
              themeData.colors['editor.selectionBackground']?.slice(0, 7) || '#2678ca',
            '--toolbar-bg-secondary':
              themeData.colors['editor.selectionBackground']?.slice(0, 7) || '#3c3c3c',
            '--toolbar-foreground': themeData.colors['editor.foreground']?.slice(0, 7) || '#fff',
            '--toolbar-accent':
              themeData.colors['editorCursor.foreground']?.slice(0, 7) || '#2678ca',
            '--panel-text-accent': themeData.colors['editor.background']?.slice(0, 7) || '#fff',
            '--panel-background': themeData.colors['editor.background']?.slice(0, 7) || '#1e1e1e',
            '--status-bar-text': themeData.base === 'vs-dark' ? 'dark' : 'light'
          });
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      }
    }
  } else {
    // No saved theme, check system preference and apply appropriate default theme
    const systemPreference = getSystemPreference();
    const defaultTheme = systemPreference === 'dark' ? 'vs-dark' : 'light';

    // Store in localStorage to maintain consistency
    localStorage.setItem('editorTheme', defaultTheme);

    // Apply default theme based on system preference
    const themeConfig = DEFAULT_THEMES[defaultTheme as keyof typeof DEFAULT_THEMES];
    setCSSVariables(themeConfig.variables);
    setCSSVariables({ '--status-bar-text': '#fff' });

    // Set document classes
    if (defaultTheme === 'vs-dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }

  // Apply theme to Monaco if it's available
  if (globalMonaco) {
    const theme =
      localStorage.getItem('editorTheme') ||
      (getSystemPreference() === 'dark' ? 'vs-dark' : 'light');
    globalMonaco.editor.setTheme(theme);
  }
};

// Run initialization immediately
if (typeof window !== 'undefined') {
  // Use setTimeout to ensure this runs after the browser has fully loaded
  setTimeout(initEditorTheme, 0);
}

// Export a utility function that components can use to apply a theme
export const applyEditorTheme = (key: string, value: string) => {
  localStorage.setItem('editorTheme', key);

  if (key in DEFAULT_THEMES) {
    const themeConfig = DEFAULT_THEMES[key as keyof typeof DEFAULT_THEMES];
    setCSSVariables(themeConfig.variables);
    setCSSVariables({ '--status-bar-text': '#fff' });

    // Set document classes
    if (key === 'vs-dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  } else {
    try {
      const themeData = getMonacoThemeData(value) || getMonacoThemeData(key);

      if (themeData) {
        // Set document classes
        if (themeData.base === 'vs-dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
        }

        setCSSVariables({
          '--toolbar-bg-primary':
            themeData.colors['editor.selectionBackground']?.slice(0, 7) || '#2678ca',
          '--toolbar-bg-secondary':
            themeData.colors['editor.selectionBackground']?.slice(0, 7) || '#3c3c3c',
          '--toolbar-foreground': themeData.colors['editor.foreground']?.slice(0, 7) || '#fff',
          '--toolbar-accent': themeData.colors['editorCursor.foreground']?.slice(0, 7) || '#2678ca',
          '--panel-text-accent': themeData.colors['editor.background']?.slice(0, 7) || '#fff',
          '--panel-background': themeData.colors['editor.background']?.slice(0, 7) || '#1e1e1e',
          '--status-bar-text': themeData.base === 'vs-dark' ? 'dark' : 'light'
        });
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  }

  if (globalMonaco) {
    globalMonaco.editor.setTheme(key);
  }

  // Return the appropriate next-themes value
  if (key === 'vs-dark') {
    return 'dark';
  } else if (key in DEFAULT_THEMES) {
    return 'light';
  } else {
    try {
      const themeData = getMonacoThemeData(value) || getMonacoThemeData(key);
      return themeData?.base === 'vs-dark' ? 'dark' : 'light';
    } catch (error) {
      console.error('Failed to determine theme mode:', error);
      return 'dark';
    }
  }
};
