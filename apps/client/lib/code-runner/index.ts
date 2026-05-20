import { createJudge0Runner } from './judge0';
import { createPistonRunner, getPistonExecuteUrl, isLocalPistonUrl } from './piston';
import type { CodeRunner, CodeRunnerProvider } from './types';

export type { CodeRunner, CodeRunnerProvider, ExecuteParams, RuntimeInfo } from './types';

export const getCodeRunnerProvider = (): CodeRunnerProvider => {
  const explicit = process.env.CODE_RUNNER_PROVIDER?.trim().toLowerCase();
  if (explicit === 'judge0' || explicit === 'piston') return explicit;

  const pistonUrl = getPistonExecuteUrl();
  if (pistonUrl && (isLocalPistonUrl(pistonUrl) || !pistonUrl.includes('emkc.org'))) {
    return 'piston';
  }

  return 'judge0';
};

let runner: CodeRunner | null = null;

export const getCodeRunner = (): CodeRunner => {
  if (runner) return runner;

  const provider = getCodeRunnerProvider();
  if (provider === 'piston') {
    const url = getPistonExecuteUrl();
    if (!url) {
      throw new Error('PISTON_API_URL is required when CODE_RUNNER_PROVIDER=piston');
    }
    runner = createPistonRunner(url);
  } else {
    runner = createJudge0Runner();
  }

  return runner;
};
