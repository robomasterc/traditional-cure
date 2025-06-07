import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Sidebar } from '@/components/ui/sidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.roles?.includes('admin')) {
    redirect('/unauthorized');
  }

  return (
    <div className="flex h-screen">
      <Sidebar userRoles={session.roles} userName={session.user?.name ?? ''} />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
} 