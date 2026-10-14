import { NextResponse } from 'next/server';
import { getExecutiveOverview } from '@/lib/services';

export async function GET() {
  try {
    const data = await getExecutiveOverview();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
