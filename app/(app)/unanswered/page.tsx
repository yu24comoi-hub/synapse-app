import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { store } from "@/lib/store";
import { groups } from "@/lib/groups";
import ContentCard from "@/components/content/ContentCard";

export default async function UnansweredPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const group = await groups.getByUserId(userId);
  const allSessions = group ? await store.getAll(group.id) : [];
  const unanswered = allSessions.filter(
    (s) => !s.answers.some((a) => a.memberId === userId)
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">未回答</h2>
        <p className="text-sm text-gray-400 mt-0.5">まだ回答していないトピックの一覧</p>
      </div>

      {unanswered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-4">✅</p>
          <p className="text-lg font-medium mb-1">すべて回答済みです</p>
          <p className="text-sm">新しいトピックが届いたらここに表示されます</p>
        </div>
      ) : (
        <div className="space-y-3">
          {unanswered.map((s) => (
            <ContentCard key={s.content.id} session={s} userId={userId} />
          ))}
        </div>
      )}
    </div>
  );
}
