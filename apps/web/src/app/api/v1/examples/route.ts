import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/api-auth';
import { listExamples, createExample } from '@/lib/services/example-service';
import { db, schema } from '@nextjs-tpl/db';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const items = await listExamples();
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (!body.title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

  const item = await createExample(body);
  await db.insert(schema.auditLogs).values({
    actorType: 'user',
    actorId: user.id,
    action: 'example_item.create',
    targetType: 'example_item',
    targetId: item.id,
  });

  return NextResponse.json(item, { status: 201 });
}
