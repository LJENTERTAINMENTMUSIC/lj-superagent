import { NextResponse } from 'next/server';
import { runAgentOrchestrator } from '@/lib/agents/orchestrator';
import { authenticateUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, businessUnitId, channel = 'web', userId } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Resolve actor
    const actor = userId
      ? await authenticateUser(userId)
      : { id: '836b7147-c063-42ac-ab89-dcf6ed0bc890', email: 'ceo@ljgroup.com', full_name: 'LJ Executive Director', role: 'ceo', status: 'active' } as any;

    const result = await runAgentOrchestrator({
      prompt,
      actor: actor!,
      businessUnitId,
      channel,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Agent execution error:', error);
    return NextResponse.json({ error: error.message || 'Agent orchestration failed' }, { status: 500 });
  }
}
