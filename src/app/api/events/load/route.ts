import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { editorEvents } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { z } from 'zod';

const loadEventsSchema = z.object({
  sessionId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = loadEventsSchema.parse(body);

    // Get the latest snapshot event for this session
    const latestSnapshot = await db.query.editorEvents.findFirst({
      where: and(
        eq(editorEvents.sessionId, validated.sessionId),
        eq(editorEvents.eventType, 'snapshot')
      ),
      orderBy: [desc(editorEvents.timestamp), desc(editorEvents.sequenceNumber)],
    });

    if (!latestSnapshot) {
      return NextResponse.json({ snapshot: null }, { status: 200 });
    }

    // Return the snapshot data
    return NextResponse.json(
      {
        snapshot: latestSnapshot.eventData || null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Load events error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to load events' },
      { status: 500 }
    );
  }
}
