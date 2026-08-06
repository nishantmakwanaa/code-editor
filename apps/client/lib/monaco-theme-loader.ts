/**
 * Monaco editor theme loader utility.
 * Statically loads monaco theme JSON files to prevent dynamic require resolution errors in Next.js bundler.
 *
 * By Nishant Makwana (https://nishantmakwanaa.lovable.app)
 */

import themeList from 'monaco-themes/themes/themelist.json';

export interface MonacoThemeData {
  base: string;
  inherit?: boolean;
  rules?: Array<Record<string, unknown>>;
  colors: Record<string, string>;
}

/* eslint-disable @typescript-eslint/no-require-imports */
const themesByName: Record<string, MonacoThemeData> = {
  Active4D: require('monaco-themes/themes/Active4D.json'),
  'All Hallows Eve': require('monaco-themes/themes/All Hallows Eve.json'),
  Amy: require('monaco-themes/themes/Amy.json'),
  'Birds of Paradise': require('monaco-themes/themes/Birds of Paradise.json'),
  Blackboard: require('monaco-themes/themes/Blackboard.json'),
  'Brilliance Black': require('monaco-themes/themes/Brilliance Black.json'),
  'Brilliance Dull': require('monaco-themes/themes/Brilliance Dull.json'),
  'Chrome DevTools': require('monaco-themes/themes/Chrome DevTools.json'),
  'Clouds Midnight': require('monaco-themes/themes/Clouds Midnight.json'),
  Clouds: require('monaco-themes/themes/Clouds.json'),
  Cobalt: require('monaco-themes/themes/Cobalt.json'),
  Cobalt2: require('monaco-themes/themes/Cobalt2.json'),
  Dawn: require('monaco-themes/themes/Dawn.json'),
  'Dominion Day': require('monaco-themes/themes/Dominion Day.json'),
  Dracula: require('monaco-themes/themes/Dracula.json'),
  Dreamweaver: require('monaco-themes/themes/Dreamweaver.json'),
  Eiffel: require('monaco-themes/themes/Eiffel.json'),
  'Espresso Libre': require('monaco-themes/themes/Espresso Libre.json'),
  'GitHub Dark': require('monaco-themes/themes/GitHub Dark.json'),
  'GitHub Light': require('monaco-themes/themes/GitHub Light.json'),
  GitHub: require('monaco-themes/themes/GitHub.json'),
  IDLE: require('monaco-themes/themes/IDLE.json'),
  Katzenmilch: require('monaco-themes/themes/Katzenmilch.json'),
  'Kuroir Theme': require('monaco-themes/themes/Kuroir Theme.json'),
  LAZY: require('monaco-themes/themes/LAZY.json'),
  'MagicWB (Amiga)': require('monaco-themes/themes/MagicWB (Amiga).json'),
  'Merbivore Soft': require('monaco-themes/themes/Merbivore Soft.json'),
  Merbivore: require('monaco-themes/themes/Merbivore.json'),
  'Monokai Bright': require('monaco-themes/themes/Monokai Bright.json'),
  Monokai: require('monaco-themes/themes/Monokai.json'),
  'Night Owl': require('monaco-themes/themes/Night Owl.json'),
  Nord: require('monaco-themes/themes/Nord.json'),
  'Oceanic Next': require('monaco-themes/themes/Oceanic Next.json'),
  'Pastels on Dark': require('monaco-themes/themes/Pastels on Dark.json'),
  'Slush and Poppies': require('monaco-themes/themes/Slush and Poppies.json'),
  'Solarized-dark': require('monaco-themes/themes/Solarized-dark.json'),
  'Solarized-light': require('monaco-themes/themes/Solarized-light.json'),
  SpaceCadet: require('monaco-themes/themes/SpaceCadet.json'),
  Sunburst: require('monaco-themes/themes/Sunburst.json'),
  'Textmate (Mac Classic)': require('monaco-themes/themes/Textmate (Mac Classic).json'),
  'Tomorrow-Night-Blue': require('monaco-themes/themes/Tomorrow-Night-Blue.json'),
  'Tomorrow-Night-Bright': require('monaco-themes/themes/Tomorrow-Night-Bright.json'),
  'Tomorrow-Night-Eighties': require('monaco-themes/themes/Tomorrow-Night-Eighties.json'),
  'Tomorrow-Night': require('monaco-themes/themes/Tomorrow-Night.json'),
  Tomorrow: require('monaco-themes/themes/Tomorrow.json'),
  Twilight: require('monaco-themes/themes/Twilight.json'),
  'Upstream Sunburst': require('monaco-themes/themes/Upstream Sunburst.json'),
  'Vibrant Ink': require('monaco-themes/themes/Vibrant Ink.json'),
  Xcode_default: require('monaco-themes/themes/Xcode_default.json'),
  Zenburnesque: require('monaco-themes/themes/Zenburnesque.json'),
  iPlastic: require('monaco-themes/themes/iPlastic.json'),
  idleFingers: require('monaco-themes/themes/idleFingers.json'),
  krTheme: require('monaco-themes/themes/krTheme.json'),
  monoindustrial: require('monaco-themes/themes/monoindustrial.json')
};
/* eslint-enable @typescript-eslint/no-require-imports */

// Secondary map indexed by key slug (e.g. 'dracula', 'solarized-dark')
const themesByKey: Record<string, MonacoThemeData> = {};
Object.entries(themeList).forEach(([key, value]) => {
  if (themesByName[value]) {
    themesByKey[key] = themesByName[value];
  }
});

export const getMonacoThemeData = (nameOrKey: string): MonacoThemeData | null => {
  return themesByName[nameOrKey] || themesByKey[nameOrKey] || null;
};
