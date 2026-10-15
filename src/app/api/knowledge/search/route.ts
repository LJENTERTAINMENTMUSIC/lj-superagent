import { NextResponse } from 'next/server';
import { searchKnowledgeBase } from '@/lib/knowledge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, businessUnitId, limit } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const results = await searchKnowledgeBase({
      query,
      businessUnitId,
      limit: limit ? Number(limit) : 5,
    });

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Knowledge search error:', error);
    return NextResponse.json({ error: error.message || 'Search failed' }, { status: 500 });
  }
}
