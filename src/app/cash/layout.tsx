import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Container } from "@/components/ui/container";
import { Sidebar } from "@/components/ui/sidebar";
import { UserRole } from "@/types/auth";

export default async function CashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userRoles = (session as any).roles as UserRole[] || [];
  const userName = session.user.name || 'User';

  return (
    <div className="flex h-screen">
      <Sidebar userRoles={userRoles} userName={userName} />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <Container className="py-6">{children}</Container>
      </main>
    </div>
  );
} 