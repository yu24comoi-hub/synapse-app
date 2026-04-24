import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { userSettings } from "@/lib/settings";
import SettingsForm from "@/components/settings/SettingsForm";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const s = await userSettings.get(session!.user.id);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">設定</h2>
      <SettingsForm
        userId={session!.user.id}
        initialDisplayName={s?.displayName ?? session!.user.name ?? ""}
        initialInterests={s?.interests ?? []}
      />
    </div>
  );
}
