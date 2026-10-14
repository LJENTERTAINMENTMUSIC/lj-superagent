import { NextRequest, NextResponse } from 'next/server';
import { runAICopilotQuery } from '@/lib/services';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const response = await runAICopilotQuery(query);
    return NextResponse.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'AI Copilot failed to process query';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
