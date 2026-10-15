import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ingestDocument } from '@/lib/knowledge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bu = searchParams.get('bu');

    let query = supabase
      .from('bos_documents')
      .select('*, business_unit:bos_business_units(name, code, color)')
      .order('created_at', { ascending: false });

    if (bu) {
      query = query.eq('business_unit_id', bu);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, fileName, fileType, content, businessUnitId, department, author, verificationStatus } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Document title and content are required' }, { status: 400 });
    }

    const result = await ingestDocument({
      title,
      fileName: fileName || `${title.toLowerCase().replace(/\s+/g, '_')}.${fileType || 'txt'}`,
      fileType: fileType || 'txt',
      content,
      businessUnitId,
      department,
      author,
      verificationStatus,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Document ingestion error:', error);
    return NextResponse.json({ error: error.message || 'Ingestion failed' }, { status: 500 });
  }
}
