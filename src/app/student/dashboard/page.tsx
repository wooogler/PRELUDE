import { db } from '@/db/db';
import { assignments, instructors, studentSessions, editorEvents } from '@/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import JoinAssignmentForm from '@/components/student/JoinAssignmentForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardHeaderActions from '@/components/student/DashboardHeaderActions';

async function getStudent() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_session')?.value;

  if (!userId) {
    return null;
  }

  const user = await db.query.instructors.findFirst({
    where: eq(instructors.id, userId),
  });

  if (!user || user.role !== 'student') {
    return null;
  }

  return user;
}

export default async function StudentDashboardPage() {
  const student = await getStudent();

  if (!student) {
    redirect('/login');
  }

  const sessions = await db
    .select({
      sessionId: studentSessions.id,
      assignmentId: assignments.id,
      title: assignments.title,
      deadline: assignments.deadline,
      shareToken: assignments.shareToken,
      startedAt: studentSessions.startedAt,
      lastLoginAt: studentSessions.lastLoginAt,
    })
    .from(studentSessions)
    .innerJoin(assignments, eq(studentSessions.assignmentId, assignments.id))
    .where(eq(studentSessions.userId, student.id))
    .orderBy(desc(studentSessions.startedAt));

  const sessionsWithActivity = await Promise.all(
    sessions.map(async (session) => {
      const [result] = await db
        .select({
          lastSubmissionAt: sql`max(${editorEvents.timestamp})`,
        })
        .from(editorEvents)
        .where(and(
          eq(editorEvents.sessionId, session.sessionId),
          eq(editorEvents.eventType, 'submission')
        ));

      return {
        ...session,
        lastSubmissionAt: (result?.lastSubmissionAt as Date | null) ?? null,
      };
    })
  );

  const formatDateTime = (value: Date | null) => {
    if (!value) {
      return '—';
    }
    return new Date(value).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <header className="bg-[hsl(var(--card))] border-b border-[hsl(var(--border))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">SWAG</h1>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Student Dashboard</p>
            </div>
            <DashboardHeaderActions email={student.email} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Join a new assignment</CardTitle>
            <CardDescription>Enter a share link or token provided by your instructor</CardDescription>
          </CardHeader>
          <CardContent>
            <JoinAssignmentForm />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Your Assignments</h2>

          {sessionsWithActivity.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-[hsl(var(--muted-foreground))]">No assignments yet</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                  Join an assignment using the form above
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[hsl(var(--muted)/0.5)] border-b border-[hsl(var(--border))]">
                    <tr>
                      <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider text-xs">
                        Title
                      </th>
                      <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider text-xs">
                        Deadline
                      </th>
                      <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider text-xs">
                        Last Active
                      </th>
                      <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider text-xs">
                        Last Submission
                      </th>
                      <th className="px-6 py-3 font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider text-xs text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[hsl(var(--border))]">
                    {sessionsWithActivity.map((session) => (
                      <tr key={session.sessionId} className="group hover:bg-[hsl(var(--muted)/0.3)] transition-colors">
                        <td className="px-6 py-4 font-medium text-[hsl(var(--foreground))]">
                          {session.title}
                        </td>
                        <td className="px-6 py-4 text-[hsl(var(--muted-foreground))]">
                          {new Date(session.deadline).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-[hsl(var(--muted-foreground))]">
                          {formatDateTime(session.lastLoginAt ?? session.startedAt)}
                        </td>
                        <td className="px-6 py-4 text-[hsl(var(--muted-foreground))]">
                          {formatDateTime(session.lastSubmissionAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/s/${session.shareToken}/editor/${session.sessionId}`}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 rounded-md px-3 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90"
                          >
                            Open
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div >
  );
}
