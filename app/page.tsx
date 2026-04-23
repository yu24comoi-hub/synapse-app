import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginButton from "@/components/auth/LoginButton";

export default async function RootPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/home");

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="text-center space-y-8 p-8">
        <div>
          <h1 className="text-6xl font-bold text-gray-900 tracking-tight">Synapse</h1>
          <p className="text-gray-500 mt-3 text-lg">グループで未知の知に出会う</p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <LoginButton />
        </div>
      </div>
    </main>
  );
}
