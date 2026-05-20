/**
 * Lists programming languages available on the configured code runner.
 */

import { NextResponse } from 'next/server';

import { getCodeRunner } from '@/lib/code-runner';

export async function GET() {
  try {
    const runner = getCodeRunner();
    const runtimes = await runner.listRuntimes();
    const monacoIds = runner.getRunnableMonacoLanguageIds(runtimes);

    return NextResponse.json({
      provider: runner.provider,
      runtimes,
      monacoIds
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch runtimes';
    return NextResponse.json(
      { error: message, runtimes: [], monacoIds: [], provider: null },
      { status: 500 }
    );
  }
}
