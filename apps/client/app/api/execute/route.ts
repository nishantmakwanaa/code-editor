/**
 * API route handler for executing code submissions.
 */

import { NextResponse } from 'next/server';

import { getCodeRunner } from '@/lib/code-runner';

interface RequestBody {
  code: string;
  language: string;
  args?: string[];
  stdin?: string;
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();

    if (!body.code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    if (!body.language) {
      return NextResponse.json({ error: 'Language is required' }, { status: 400 });
    }

    const runner = getCodeRunner();
    const runtimes = await runner.listRuntimes();

    if (!runner.supportsLanguage(body.language, runtimes)) {
      return NextResponse.json(
        { error: runner.formatNotFoundError(body.language, runtimes) },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    request.signal.addEventListener('abort', () => controller.abort());

    const result = await runner.execute({
      code: body.code,
      language: body.language,
      stdin: body.stdin,
      args: body.args,
      signal: controller.signal
    });

    const metadata = {
      args: body.args || [],
      stdin: body.stdin || '',
      timestamp: new Date().toISOString(),
      runner: runner.provider
    };

    return NextResponse.json({ ...result, metadata });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return NextResponse.json({ error: 'Code execution cancelled' }, { status: 499 });
    }

    console.error('Code execution error:', error);
    const message =
      error instanceof Error && error.message.includes('fetch failed')
        ? 'Cannot reach the code runner. Check your network or CODE_RUNNER_PROVIDER settings.'
        : error instanceof Error
          ? error.message
          : 'Failed to execute code';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
