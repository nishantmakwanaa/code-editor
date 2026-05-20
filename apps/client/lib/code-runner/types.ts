import type { ExecutionResult } from '@codex/types/terminal';

export type CodeRunnerProvider = 'judge0' | 'piston';

export type RuntimeInfo = {
  language: string;
  version: string;
  aliases?: string[];
};

export type ExecuteParams = {
  code: string;
  language: string;
  stdin?: string;
  args?: string[];
  signal?: AbortSignal;
};

export type CodeRunner = {
  provider: CodeRunnerProvider;
  listRuntimes: () => Promise<RuntimeInfo[]>;
  supportsLanguage: (monacoLanguageId: string, runtimes: RuntimeInfo[]) => boolean;
  execute: (params: ExecuteParams) => Promise<ExecutionResult>;
  formatNotFoundError: (monacoLanguageId: string, runtimes: RuntimeInfo[]) => string;
  getRunnableMonacoLanguageIds: (runtimes: RuntimeInfo[]) => string[];
};
