import { db } from '@/db/db';
import { instructors } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import BackLink from '@/components/ui/BackLink';
import DeleteAccountButton from '@/app/instructor/settings/DeleteAccountButton';
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

export default async function StudentSettingsPage() {
  const student = await getStudent();

  if (!student) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <header className="bg-[hsl(var(--card))] border-b border-[hsl(var(--border))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">SWAG</h1>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Student Settings</p>
            </div>
            <div className="flex items-center gap-4">
              <BackLink href="/student/dashboard" label="Back to Dashboard" className="text-sm text-[hsl(var(--muted-foreground))]" />
              <DashboardHeaderActions email={student.email} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>View your profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Email</label>
                <p className="text-[hsl(var(--foreground))] font-medium">{student.email}</p>
              </div>
              {(student.firstName || student.lastName) && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Name</label>
                  <p className="text-[hsl(var(--foreground))]">{`${student.firstName || ''} ${student.lastName || ''}`.trim()}</p>
                </div>
              )}
              <div className="space-y-1">
                <label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Member Since</label>
                <p className="text-[hsl(var(--foreground))]">
                  {new Date(student.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              {student.lastLoginAt && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Last Login</label>
                  <p className="text-[hsl(var(--foreground))]">
                    {new Date(student.lastLoginAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/20 bg-destructive/5 dark:bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription className="text-destructive/80">
              Irreversible account actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Once you delete your account, there is no going back. This will permanently delete your account
                and all of your assignment data.
              </p>
              <DeleteAccountButton />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
