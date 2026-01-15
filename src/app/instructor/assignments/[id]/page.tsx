import { db } from '@/db/db';
import { assignments, instructors, studentSessions, editorEvents } from '@/db/schema';
import { eq, desc, count, and } from 'drizzle-orm';
import { cookies, headers } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import BackLink from '@/components/ui/BackLink';
import DeleteAssignmentButton from './DeleteAssignmentButton';
import AssignmentTabs from './AssignmentTabs';

async function getInstructor() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_session')?.value;

  if (!userId) {
    return null;
  }

  const user = await db.query.instructors.findFirst({
    where: eq(instructors.id, userId),
  });

  if (!user || user.role !== 'instructor') {
    return null;
  }

  return user;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AssignmentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const instructor = await getInstructor();

  if (!instructor) {
    redirect('/login');
  }

  const requestHeaders = await headers();
  const forwardedProto = requestHeaders.get('x-forwarded-proto') ?? 'http';
  const forwardedHost = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host');
  const baseUrl = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');

  // Get assignment
  const assignment = await db.query.assignments.findFirst({
    where: and(
      eq(assignments.id, id),
      eq(assignments.instructorId, instructor.id)
    ),
  });

  if (!assignment) {
    notFound();
  }

  // Get students with their event statistics
  const students = await db
    .select({
      id: studentSessions.id,
      studentFirstName: studentSessions.studentFirstName,
      studentLastName: studentSessions.studentLastName,
      studentEmail: studentSessions.studentEmail,
      startedAt: studentSessions.startedAt,
      lastSavedAt: studentSessions.lastSavedAt,
    })
    .from(studentSessions)
    .where(eq(studentSessions.assignmentId, id))
    .orderBy(studentSessions.studentLastName, studentSessions.studentFirstName);

  // Get event statistics for each student
  const studentsWithStats = await Promise.all(
    students.map(async (student) => {
      // Count events by type
      const eventCounts = await db
        .select({
          eventType: editorEvents.eventType,
          count: count(),
        })
        .from(editorEvents)
        .where(eq(editorEvents.sessionId, student.id))
        .groupBy(editorEvents.eventType);

      const stats = {
        submissions: 0,
        pasteInternal: 0,
        pasteExternal: 0,
        snapshots: 0,
      };

      eventCounts.forEach(({ eventType, count: c }) => {
        if (eventType === 'submission') stats.submissions = c;
        else if (eventType === 'paste_internal') stats.pasteInternal = c;
        else if (eventType === 'paste_external') stats.pasteExternal = c;
        else if (eventType === 'snapshot') stats.snapshots = c;
      });

      return { ...student, stats };
    })
  );

  const shareUrl = `${baseUrl}/s/${assignment.shareToken}`;
  const isOverdue = new Date(assignment.deadline) < new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <BackLink href="/instructor/dashboard" label="Back" />
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{assignment.title}</h1>
              <p className={`text-sm ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                Deadline: {new Date(assignment.deadline).toLocaleString()}
                {isOverdue && ' (Overdue)'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/instructor/assignments/${id}/edit`}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Edit
              </Link>
              <DeleteAssignmentButton assignmentId={id} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AssignmentTabs
          assignment={assignment}
          students={studentsWithStats}
          shareUrl={shareUrl}
        />
      </main>
    </div>
  );
}
