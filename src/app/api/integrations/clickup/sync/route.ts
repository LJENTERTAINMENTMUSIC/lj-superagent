import { NextRequest, NextResponse } from 'next/server';
import { triggerClickUpSyncSimulation, getIntegrationStatus } from '@/lib/services';

export async function GET() {
  try {
    const statuses = await getIntegrationStatus();
    return NextResponse.json(statuses);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch integrations';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { actorId } = body;
    const res = await triggerClickUpSyncSimulation(actorId || 'system');
    return NextResponse.json(res);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Sync failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
