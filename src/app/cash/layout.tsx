'use client';

import { Sidebar } from "@/components/ui/sidebar";
import { TabProvider } from "@/contexts/TabContext";
import { TabBar } from "@/components/ui/tab-bar";
import { TabContent } from "@/components/ui/tab-content";
import { TabNotification } from "@/components/ui/tab-notification";
import { UserRole } from "@/types/auth";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { redirect } from "next/navigation";

export default function CashLayout() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const userRoles = (session as { roles?: UserRole[] }).roles || [];
  const userName = session.user.name || 'User';

  return (
    <TabProvider>
      <div className="flex h-screen">
        <Sidebar userRoles={userRoles} userName={userName} />
        <main className="flex-1 flex flex-col bg-gray-50">
          <TabBar />
          <div className="flex-1 overflow-hidden">
            <TabContent className="p-6" />
          </div>
        </main>
      </div>
      <TabNotification />
    </TabProvider>
  );
} 