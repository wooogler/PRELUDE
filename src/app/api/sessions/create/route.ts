import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { studentSessions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const createSessionSchema = z.object({
  assignmentId: z.string().uuid(),
  studentName: z.string().min(1).max(100),
  studentEmail: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = createSessionSchema.parse(body);

    // Check if a session already exists for this email + assignment combination
    const existingSession = await db.query.studentSessions.findFirst({
      where: and(
        eq(studentSessions.studentEmail, validated.studentEmail),
        eq(studentSessions.assignmentId, validated.assignmentId)
      ),
    });

    let sessionId: string;
    let isExisting = false;

    if (existingSession) {
      // Reuse existing session
      sessionId = existingSession.id;
      isExisting = true;
      console.log(`Existing session found for ${validated.studentEmail}: ${sessionId}`);
    } else {
      // Create new session
      sessionId = crypto.randomUUID();

      await db.insert(studentSessions).values({
        id: sessionId,
        assignmentId: validated.assignmentId,
        studentName: validated.studentName,
        studentEmail: validated.studentEmail,
        startedAt: new Date(),
        lastSavedAt: null,
      });

      console.log(`New session created for ${validated.studentEmail}: ${sessionId}`);
    }

    return NextResponse.json(
      { sessionId, isExisting },
      {
        status: isExisting ? 200 : 201,
        headers: {
          // Set HTTP-only cookie for additional security
          'Set-Cookie': `prelude_session=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`,
        },
      }
    );
  } catch (error) {
    console.error('Session creation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
