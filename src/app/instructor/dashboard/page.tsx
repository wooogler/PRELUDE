import { db } from '@/db/db';
import { assignments, instructors, studentSessions } from '@/db/schema';
import { eq, desc, count } from 'drizzle-orm';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import CopyLinkButton from '@/components/instructor/CopyLinkButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import InstructorHeaderActions from '@/components/instructor/InstructorHeaderActions';
import { Plus, Users, Calendar, Edit2 } from 'lucide-react';

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

export default async function DashboardPage() {
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

  // Get instructor's assignments with student counts
  const instructorAssignments = await db
    .select({
      id: assignments.id,
      title: assignments.title,
      deadline: assignments.deadline,
      shareToken: assignments.shareToken,
      createdAt: assignments.createdAt,
    })
    .from(assignments)
    .where(eq(assignments.instructorId, instructor.id))
    .orderBy(desc(assignments.createdAt));

  // Get student counts for each assignment
  const assignmentWithCounts = await Promise.all(
    instructorAssignments.map(async (assignment) => {
      const [result] = await db
        .select({ count: count() })
        .from(studentSessions)
        .where(eq(studentSessions.assignmentId, assignment.id));

      return {
        ...assignment,
        studentCount: result?.count || 0,
      };
    })
  );

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Header */}
      <header className="bg-[hsl(var(--card))] border-b border-[hsl(var(--border))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-heading text-[hsl(var(--foreground))]">SWAG</h1>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Instructor Dashboard</p>
            </div>
            <InstructorHeaderActions email={instructor.email} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Create Assignment Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold font-heading text-[hsl(var(--foreground))]">Your Assignments</h2>
          <Link href="/instructor/assignments/new">
            <Button className="font-medium gap-2">
              <Plus className="w-4 h-4" />
              New Assignment
            </Button>
          </Link>
        </div>

        {/* Assignments List */}
        {assignmentWithCounts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-[hsl(var(--muted))] p-4 rounded-full mb-4">
                <Calendar className="w-8 h-8 text-[hsl(var(--muted-foreground))]" />
              </div>
              <h3 className="text-lg font-medium text-[hsl(var(--foreground))]">No assignments yet</h3>
              <p className="text-[hsl(var(--muted-foreground))] mt-1 max-w-sm">
                Create your first assignment to verify student essays.
              </p>
              <Link href="/instructor/assignments/new" className="mt-6">
                <Button>Create Assignment</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[hsl(var(--border))]">
                <thead className="bg-[hsl(var(--muted))]/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                      Deadline
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                      Students
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                      Share Link
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[hsl(var(--card))] divide-y divide-[hsl(var(--border))]">
                  {assignmentWithCounts.map((assignment) => {
                    const isOverdue = new Date(assignment.deadline) < new Date();
                    const shareUrl = `${baseUrl}/s/${assignment.shareToken}`;

                    return (
                      <tr key={assignment.id} className="hover:bg-[hsl(var(--muted))]/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/instructor/assignments/${assignment.id}`}
                            className="text-sm font-medium text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] hover:underline decoration-2 underline-offset-4 transition-colors block"
                          >
                            {assignment.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${isOverdue ? 'text-[hsl(var(--destructive))]' : 'text-[hsl(var(--muted-foreground))]'}`}>
                            {new Date(assignment.deadline).toLocaleDateString()}
                            {isOverdue && <span className="ml-2 text-xs font-medium">(Overdue)</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-[hsl(var(--foreground))]">
                            <Users className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                            {assignment.studentCount}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <CopyLinkButton url={shareUrl} iconOnly={false} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/instructor/assignments/${assignment.id}/edit`} title="Edit Assignment">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
