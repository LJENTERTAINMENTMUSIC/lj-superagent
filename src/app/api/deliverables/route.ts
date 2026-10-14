import { NextRequest, NextResponse } from 'next/server';
import { submitTaskDeliverable } from '@/lib/services';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { taskId, title, submissionNotes, externalLink, evidenceType, submittedBy, reviewerId } = body;

    if (!taskId || !title || !submittedBy) {
      return NextResponse.json({ error: 'taskId, title, and submittedBy are required' }, { status: 400 });
    }

    const data = await submitTaskDeliverable({
      taskId,
      title,
      submissionNotes: submissionNotes || '',
      externalLink: externalLink || '',
      evidenceType: evidenceType || 'link',
      submittedBy,
      reviewerId,
    });

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to submit deliverable';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
