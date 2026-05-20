import type { ExecutionResult } from '@codex/types/terminal';

import type { CodeRunner, ExecuteParams, RuntimeInfo } from './types';

export const getPistonExecuteUrl = (): string | undefined => process.env.PISTON_API_URL?.trim();

export const isLocalPistonUrl = (url: string): boolean => /localhost|127\.0\.0\.1/.test(url);

type PistonRuntime = RuntimeInfo;

let runtimesCache: { fetchedAt: number; runtimes: PistonRuntime[] } | null = null;
const RUNTIMES_CACHE_MS = 60_000;

const MONACO_TO_PISTON: Record<string, string> = {
  cpp: 'cpp',
  c: 'c',
  gcc: 'c',
  'c++': 'cpp',
  'g++': 'cpp',
  csharp: 'csharp.net',
  'csharp.net': 'csharp.net',
  fsharp: 'fsharp.net',
  'fsharp.net': 'fsharp.net',
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  java: 'java',
  go: 'go',
  rust: 'rust',
  php: 'php',
  ruby: 'ruby',
  swift: 'swift',
  kotlin: 'kotlin',
  bash: 'bash',
  shell: 'bash',
  r: 'r',
  lua: 'lua',
  perl: 'perl',
  haskell: 'haskell',
  scala: 'scala',
  dart: 'dart',
  elixir: 'elixir',
  clojure: 'clojure',
  deno: 'javascript',
  node: 'javascript'
};

const FILE_EXTENSION: Record<string, string> = {
  python: 'py',
  javascript: 'js',
  typescript: 'ts',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  go: 'go',
  rust: 'rs',
  php: 'php',
  ruby: 'rb',
  bash: 'sh'
};

const getPistonApiBase = (executeUrl: string): string => executeUrl.replace(/\/execute\/?$/, '');

const compareVersions = (a: string, b: string): number => {
  const pa = a.split('.').map(n => parseInt(n, 10) || 0);
  const pb = b.split('.').map(n => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
};

const fetchPistonRuntimes = async (executeUrl: string): Promise<PistonRuntime[]> => {
  const now = Date.now();
  if (runtimesCache && now - runtimesCache.fetchedAt < RUNTIMES_CACHE_MS) {
    return runtimesCache.runtimes;
  }

  const base = getPistonApiBase(executeUrl);
  const response = await fetch(`${base}/runtimes`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to list Piston languages (${response.status})`);
  }

  const runtimes = (await response.json()) as PistonRuntime[];
  runtimesCache = { fetchedAt: now, runtimes };
  return runtimes;
};

const resolvePistonRuntime = (
  runtimes: PistonRuntime[],
  monacoLanguageId: string
): { language: string; version: string } | null => {
  const id = monacoLanguageId.toLowerCase();
  const pistonName = MONACO_TO_PISTON[id] ?? id;

  const matches = runtimes.filter(
    r =>
      r.language === pistonName ||
      r.language === id ||
      r.aliases?.some(alias => alias.toLowerCase() === id || alias.toLowerCase() === pistonName)
  );

  if (!matches.length) return null;

  const best = [...matches].sort((a, b) => compareVersions(b.version, a.version))[0];
  return { language: best.language, version: best.version };
};

const buildPistonFiles = (pistonLanguage: string, code: string) => {
  if (pistonLanguage === 'java') {
    return [{ name: 'Main.java', content: code }];
  }
  const ext = FILE_EXTENSION[pistonLanguage] ?? 'txt';
  return [{ name: `main.${ext}`, content: code }];
};

const listRuntimeSummary = (runtimes: RuntimeInfo[]): string =>
  [...new Set(runtimes.map(r => `${r.language} ${r.version}`))].join(', ') || '(none)';

const getRunnableMonacoLanguageIds = (runtimes: RuntimeInfo[]): string[] => {
  const ids = new Set<string>();
  const probe = [
    'python',
    'javascript',
    'typescript',
    'java',
    'cpp',
    'c',
    'csharp',
    'go',
    'rust',
    'php',
    'ruby',
    'bash',
    'shell'
  ];

  for (const id of probe) {
    if (resolvePistonRuntime(runtimes, id)) ids.add(id);
  }

  for (const runtime of runtimes) {
    if (resolvePistonRuntime(runtimes, runtime.language)) ids.add(runtime.language);
    for (const alias of runtime.aliases ?? []) {
      if (resolvePistonRuntime(runtimes, alias)) ids.add(alias);
    }
  }

  return [...ids].sort();
};

export const createPistonRunner = (executeUrl: string): CodeRunner => ({
  provider: 'piston',

  listRuntimes: () => fetchPistonRuntimes(executeUrl),

  supportsLanguage: (monacoLanguageId, runtimes) =>
    resolvePistonRuntime(runtimes, monacoLanguageId) !== null,

  getRunnableMonacoLanguageIds,

  formatNotFoundError: (monacoLanguageId, runtimes) => {
    if (!runtimes.length) {
      return `"${monacoLanguageId}" cannot run: Piston has no languages. Run \`pnpm piston:install\`.`;
    }
    return `"${monacoLanguageId}" is not on Piston. Available: ${listRuntimeSummary(runtimes)}.`;
  },

  execute: async ({ code, language, stdin = '', args = [], signal }) => {
    const runtimes = await fetchPistonRuntimes(executeUrl);
    const runtime = resolvePistonRuntime(runtimes, language);
    if (!runtime) {
      throw new Error(`Language "${language}" is not installed on Piston`);
    }

    const local = isLocalPistonUrl(executeUrl);
    const compileTimeout =
      Number(process.env.PISTON_COMPILE_TIMEOUT_MS) || (local ? 10_000 : 10_000);
    const runTimeout = Number(process.env.PISTON_RUN_TIMEOUT_MS) || (local ? 3_000 : 5_000);

    const response = await fetch(executeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.PISTON_API_KEY
          ? { Authorization: `Bearer ${process.env.PISTON_API_KEY}` }
          : {})
      },
      body: JSON.stringify({
        language: runtime.language,
        version: runtime.version,
        files: buildPistonFiles(runtime.language, code),
        stdin,
        args,
        run_timeout: runTimeout,
        compile_timeout: compileTimeout
      }),
      signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      let message = `Piston returned ${response.status}`;
      try {
        const parsed = JSON.parse(errorText) as { message?: string };
        if (parsed.message) message = parsed.message;
      } catch {
        if (errorText) message = errorText.slice(0, 300);
      }
      throw new Error(message);
    }

    return (await response.json()) as ExecutionResult;
  }
});
