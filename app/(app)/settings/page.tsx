import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { userSettings } from "@/lib/settings";
import { groups } from "@/lib/groups";
import SettingsForm from "@/components/settings/SettingsForm";
import GroupPanel from "@/components/group/GroupPanel";
import GroupJoinCreate from "@/components/group/GroupJoinCreate";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const [s, group] = await Promise.all([
    userSettings.get(session!.user.id),
    groups.getByUserId(session!.user.id),
  ]);

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const inviteUrl = group ? `${baseUrl}/join/${group.inviteCode}` : "";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">プロフィール設定</h2>
        <SettingsForm
          userId={session!.user.id}
          initialDisplayName={s?.displayName ?? session!.user.name ?? ""}
          initialInterests={s?.interests ?? []}
        />
      </div>

      {group && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">グループ設定</h2>
          <GroupPanel group={group} inviteUrl={inviteUrl} currentUserId={session!.user.id} />
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">グループを追加</h2>
        <p className="text-sm text-gray-400 mb-4">新しいグループを作成するか、招待コードで別のグループに参加できます</p>
        <GroupJoinCreate />
      </div>
    </div>
  );
}
