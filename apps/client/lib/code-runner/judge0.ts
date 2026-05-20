import type { ExecutionResult } from '@codex/types/terminal';

import type { CodeRunner, ExecuteParams, RuntimeInfo } from './types';

const DEFAULT_JUDGE0_URL = 'https://ce.judge0.com';

type Judge0Runtime = {
  monacoId: string;
  language_id: number;
  language: string;
  version: string;
  aliases?: string[];
};

/** Latest stable Judge0 CE language IDs (https://ce.judge0.com/languages) */
const JUDGE0_RUNTIMES: Judge0Runtime[] = [
  {
    monacoId: 'python',
    language_id: 109,
    language: 'python',
    version: '3.13.2',
    aliases: ['py', 'py3']
  },
  { monacoId: 'java', language_id: 91, language: 'java', version: '17.0.6', aliases: [] },
  {
    monacoId: 'javascript',
    language_id: 102,
    language: 'javascript',
    version: '22.08.0',
    aliases: ['js', 'node']
  },
  {
    monacoId: 'typescript',
    language_id: 101,
    language: 'typescript',
    version: '5.6.2',
    aliases: ['ts']
  },
  { monacoId: 'cpp', language_id: 105, language: 'cpp', version: '14.1.0', aliases: ['c++'] },
  { monacoId: 'c', language_id: 103, language: 'c', version: '14.1.0', aliases: ['gcc'] },
  { monacoId: 'go', language_id: 107, language: 'go', version: '1.23.5', aliases: [] },
  { monacoId: 'rust', language_id: 108, language: 'rust', version: '1.85.0', aliases: ['rs'] },
  { monacoId: 'php', language_id: 98, language: 'php', version: '8.3.11', aliases: [] },
  { monacoId: 'ruby', language_id: 72, language: 'ruby', version: '2.7.0', aliases: ['rb'] },
  { monacoId: 'kotlin', language_id: 111, language: 'kotlin', version: '2.1.10', aliases: ['kt'] },
  { monacoId: 'swift', language_id: 83, language: 'swift', version: '5.2.3', aliases: [] },
  {
    monacoId: 'csharp',
    language_id: 51,
    language: 'csharp',
    version: 'mono 6.6',
    aliases: ['cs', 'c#']
  },
  {
    monacoId: 'bash',
    language_id: 46,
    language: 'bash',
    version: '5.0.0',
    aliases: ['sh', 'shell']
  },
  { monacoId: 'r', language_id: 99, language: 'r', version: '4.4.1', aliases: [] },
  { monacoId: 'scala', language_id: 112, language: 'scala', version: '3.4.2', aliases: [] },
  { monacoId: 'perl', language_id: 85, language: 'perl', version: '5.28.1', aliases: ['pl'] },
  { monacoId: 'haskell', language_id: 61, language: 'haskell', version: '8.8.1', aliases: ['hs'] },
  { monacoId: 'lua', language_id: 64, language: 'lua', version: '5.3.5', aliases: [] },
  { monacoId: 'dart', language_id: 90, language: 'dart', version: '2.19.2', aliases: [] },
  { monacoId: 'elixir', language_id: 57, language: 'elixir', version: '1.9.4', aliases: ['ex'] },
  {
    monacoId: 'clojure',
    language_id: 86,
    language: 'clojure',
    version: '1.10.1',
    aliases: ['clj']
  },
  { monacoId: 'fsharp', language_id: 87, language: 'fsharp', version: '3.1', aliases: ['fs'] },
  { monacoId: 'objc', language_id: 79, language: 'objc', version: 'clang 7', aliases: [] },
  { monacoId: 'pascal', language_id: 67, language: 'pascal', version: '3.0.4', aliases: [] },
  { monacoId: 'fortran', language_id: 59, language: 'fortran', version: '9.2.0', aliases: [] },
  { monacoId: 'ocaml', language_id: 65, language: 'ocaml', version: '4.09.0', aliases: [] }
];

const MONACO_ALIASES: Record<string, string> = {
  node: 'javascript',
  deno: 'javascript',
  gcc: 'c',
  'c++': 'cpp',
  'g++': 'cpp',
  cs: 'csharp',
  'c#': 'csharp',
  shell: 'bash',
  kt: 'kotlin',
  rs: 'rust',
  py: 'python',
  py3: 'python',
  js: 'javascript',
  ts: 'typescript'
};

const getJudge0BaseUrl = (): string =>
  (process.env.JUDGE0_API_URL || DEFAULT_JUDGE0_URL).replace(/\/$/, '');

const resolveJudge0Runtime = (monacoLanguageId: string): Judge0Runtime | null => {
  const id = monacoLanguageId.toLowerCase();
  const canonical = MONACO_ALIASES[id] ?? id;

  return (
    JUDGE0_RUNTIMES.find(
      r =>
        r.monacoId === canonical ||
        r.monacoId === id ||
        r.language === canonical ||
        r.aliases?.includes(id) ||
        r.aliases?.includes(canonical)
    ) ?? null
  );
};

const prepareSource = (runtime: Judge0Runtime, code: string): string => {
  if (runtime.language === 'java' && !/\bclass\s+/.test(code)) {
    return `public class Main {\n  public static void main(String[] args) {\n${code}\n  }\n}`;
  }
  return code;
};

type Judge0Submission = {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  status?: { id: number; description: string };
  time?: string;
  exit_code?: number | null;
};

const toExecutionResult = (
  submission: Judge0Submission,
  runtime: Judge0Runtime,
  executionTimeMs?: number
): ExecutionResult => {
  const accepted = submission.status?.id === 3;
  const compileErr = submission.compile_output?.trim();
  const stderr = submission.stderr?.trim() || compileErr || submission.message?.trim() || '';
  const stdout = submission.stdout ?? '';

  return {
    language: runtime.language,
    version: runtime.version,
    run: {
      stdout: compileErr ? '' : stdout,
      stderr,
      code: accepted ? (submission.exit_code ?? 0) : 1,
      signal: null,
      output: stdout || stderr
    },
    executionTime: executionTimeMs
  };
};

const listRuntimeSummary = (runtimes: RuntimeInfo[]): string =>
  [...new Set(runtimes.map(r => `${r.language} ${r.version}`))].join(', ') || '(none)';

export const createJudge0Runner = (): CodeRunner => ({
  provider: 'judge0',

  listRuntimes: async () =>
    JUDGE0_RUNTIMES.map(({ language, version, aliases }) => ({ language, version, aliases })),

  supportsLanguage: monacoLanguageId => resolveJudge0Runtime(monacoLanguageId) !== null,

  getRunnableMonacoLanguageIds: () => {
    const ids = new Set<string>();
    for (const r of JUDGE0_RUNTIMES) {
      ids.add(r.monacoId);
      for (const alias of r.aliases ?? []) ids.add(alias);
    }
    return [...ids].sort();
  },

  formatNotFoundError: (monacoLanguageId, runtimes) =>
    `"${monacoLanguageId}" is not supported by Judge0. Available: ${listRuntimeSummary(runtimes)}.`,

  execute: async ({ code, language, stdin = '', args = [], signal }: ExecuteParams) => {
    const runtime = resolveJudge0Runtime(language);
    if (!runtime) {
      throw new Error(`Language "${language}" is not supported by Judge0`);
    }

    const base = getJudge0BaseUrl();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = process.env.JUDGE0_AUTH_TOKEN?.trim();
    if (token) headers['X-Auth-Token'] = token;

    const started = Date.now();
    const response = await fetch(`${base}/submissions?wait=true&base64_encoded=false`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        source_code: prepareSource(runtime, code),
        language_id: runtime.language_id,
        stdin,
        command_line_arguments: args.length ? args.join(' ') : undefined
      }),
      signal
    });

    if (!response.ok) {
      const text = await response.text();
      let message = `Judge0 returned ${response.status}`;
      try {
        const parsed = JSON.parse(text) as { message?: string };
        if (parsed.message) message = parsed.message;
      } catch {
        if (text) message = text.slice(0, 300);
      }
      throw new Error(message);
    }

    const submission = (await response.json()) as Judge0Submission;
    return toExecutionResult(submission, runtime, Date.now() - started);
  }
});
