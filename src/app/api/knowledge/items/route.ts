import { NextResponse } from 'next/server';
import { getKnowledgeItems, getKnowledgeGaps } from '@/lib/knowledge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bu = searchParams.get('bu') || undefined;

    const [items, gaps] = await Promise.all([
      getKnowledgeItems(bu),
      getKnowledgeGaps(bu),
    ]);

    return NextResponse.json({
      items,
      gaps,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
