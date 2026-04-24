import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { store } from "@/lib/store";
import { groups } from "@/lib/groups";
import ContentCard from "@/components/content/ContentCard";
import CurateButton from "@/components/content/CurateButton";
import PostButton from "@/components/content/PostButton";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const group = await groups.getByUserId(session!.user.id);
  const sessions = group ? await store.getAll(group.id) : [];
  const userId = session!.user.id;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">キュレーション</h2>
          {group && <p className="text-xs text-gray-400 mt-0.5">{group.name}</p>}
        </div>
        <div className="flex items-center gap-2">
          <PostButton />
          <CurateButton />
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-4">🧠</p>
          <p className="text-lg font-medium mb-1">まだコンテンツがありません</p>
          <p className="text-sm">「新しいトピックをキュレーション」を押すか、自分で投稿してください</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <ContentCard key={s.content.id} session={s} userId={userId} />
          ))}
        </div>
      )}
    </div>
  );
}
