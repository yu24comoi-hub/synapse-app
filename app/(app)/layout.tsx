import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { groups } from "@/lib/groups";
import { redirect } from "next/navigation";
import Link from "next/link";
import GroupSwitcher from "@/components/group/GroupSwitcher";
import NotificationBell from "@/components/layout/NotificationBell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const [activeGroup, userGroups] = await Promise.all([
    groups.getByUserId(session.user.id),
    groups.getAllForUser(session.user.id),
  ]);

  if (!activeGroup) redirect("/setup");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/home" className="text-xl font-bold text-indigo-600 tracking-tight">
            Synapse
          </Link>
          <nav className="flex items-center gap-3">
            <GroupSwitcher groups={userGroups} activeGroupId={activeGroup.id} />
            <Link href="/stock" className="text-sm text-gray-400 hover:text-gray-700 transition-colors" title="ストック">
              🔖
            </Link>
            <NotificationBell />
            <Link href="/settings" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
              設定
            </Link>
            {session.user.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.user.image} alt="" className="w-8 h-8 rounded-full" />
            )}
          </nav>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
