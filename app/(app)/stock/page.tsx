import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stock } from "@/lib/stock";
import { store } from "@/lib/store";
import ContentCard from "@/components/content/ContentCard";

export default async function StockPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const stockedIds = await stock.getIds(userId);
  const sessions = (
    await Promise.all(stockedIds.map((id) => store.get(id)))
  ).filter(Boolean) as Awaited<ReturnType<typeof store.get>>[];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">ストック</h2>

      {sessions.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-4">🔖</p>
          <p className="text-lg font-medium mb-1">ストックがありません</p>
          <p className="text-sm">気になったトピックのブックマークアイコンを押してストックできます</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) =>
            s ? (
              <ContentCard
                key={s.content.id}
                session={s}
                userId={userId}
                isStocked={true}
              />
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
