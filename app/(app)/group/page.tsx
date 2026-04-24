import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { groups } from "@/lib/groups";
import GroupPanel from "@/components/group/GroupPanel";

export default async function GroupPage() {
  const session = await getServerSession(authOptions);
  const group = await groups.getByUserId(session!.user.id);

  if (!group) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p>グループが見つかりません</p>
      </div>
    );
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const inviteUrl = `${baseUrl}/join/${group.inviteCode}`;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">グループ管理</h2>
      <GroupPanel
        group={group}
        inviteUrl={inviteUrl}
        currentUserId={session!.user.id}
      />
    </div>
  );
}
