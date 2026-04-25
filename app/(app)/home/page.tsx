import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { store } from "@/lib/store";
import { groups } from "@/lib/groups";
import ContentCard from "@/components/content/ContentCard";
import TodayCurationCard from "@/components/content/TodayCurationCard";
import DailyCurate from "@/components/content/DailyCurate";
import PostButton from "@/components/content/PostButton";
import { stock } from "@/lib/stock";

function todayJST(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function dateJST(iso: string): string {
  return new Date(new Date(iso).getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const group = await groups.getByUserId(session!.user.id);
  const allSessions = group ? await store.getAll(group.id) : [];
  const userId = session!.user.id;
  const stockedIds = new Set(await stock.getIds(userId));
  const today = todayJST();

  const lastCuratedAt = group ? await store.getLastCuratedAt(group.id) : null;
  const hasTodayCuration = lastCuratedAt ? dateJST(lastCuratedAt) === today : false;

  const todayCuration = allSessions.find(
    (s) => s.content.source === "ai" && dateJST(s.content.createdAt) === today
  ) ?? null;

  const feedSessions = allSessions.filter((s) => s !== todayCuration);

  return (
    <div className="space-y-6">
      {/* 今日のキュレーション */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">今日のキュレーション</h2>

        {!hasTodayCuration || !todayCuration ? (
          <DailyCurate />
        ) : (
          <TodayCurationCard session={todayCuration} userId={userId} isStocked={stockedIds.has(todayCuration.content.id)} />
        )}
      </section>

      {/* フィード */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-700">フィード</h3>
          <PostButton />
        </div>

        {feedSessions.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            まだコンテンツがありません。投稿してみましょう。
          </div>
        ) : (
          <div className="space-y-3">
            {feedSessions.map((s) => (
              <ContentCard key={s.content.id} session={s} userId={userId} isStocked={stockedIds.has(s.content.id)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
