import Link from "next/link";

const ERROR_MESSAGES: Record<string, { title: string; body: string }> = {
  Configuration: {
    title: "環境変数が設定されていません",
    body: "GOOGLE_CLIENT_ID・GOOGLE_CLIENT_SECRET・NEXTAUTH_SECRET が .env.local に設定されているか確認してください。",
  },
  AccessDenied: {
    title: "アクセスが拒否されました",
    body: "Googleアカウントでのログインが許可されませんでした。再度お試しください。",
  },
  Verification: {
    title: "認証に失敗しました",
    body: "NEXTAUTH_URL が正しく設定されているか確認してください（ローカルの場合: http://localhost:3000）",
  },
  OAuthCallback: {
    title: "OAuthコールバックエラー",
    body: "Google Cloud Console で認証済みリダイレクトURIに http://localhost:3000/api/auth/callback/google が含まれているか確認してください。",
  },
  OAuthSignin: {
    title: "Google ログイン開始エラー",
    body: "GOOGLE_CLIENT_ID と GOOGLE_CLIENT_SECRET が正しく設定されているか確認してください。",
  },
};

const CHECKLIST = [
  { label: "GOOGLE_CLIENT_ID", hint: "Google Cloud Console > 認証情報 > OAuth 2.0 クライアント ID" },
  { label: "GOOGLE_CLIENT_SECRET", hint: "Google Cloud Console > 認証情報 > OAuth 2.0 クライアントシークレット" },
  { label: "NEXTAUTH_SECRET", hint: "ターミナルで openssl rand -base64 32 を実行" },
  { label: "NEXTAUTH_URL", hint: "ローカル開発: http://localhost:3000" },
  { label: "CLAUDE_API_KEY", hint: "console.anthropic.com" },
];

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const errorKey = searchParams.error ?? "Unknown";
  const info = ERROR_MESSAGES[errorKey] ?? {
    title: `認証エラー (${errorKey})`,
    body: "ログインに失敗しました。.env.local の設定を確認してください。",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <h1 className="font-bold text-red-800 text-lg mb-2">{info.title}</h1>
          <p className="text-red-700 text-sm">{info.body}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">.env.local チェックリスト</h2>
          <p className="text-xs text-gray-500">
            プロジェクトルートに .env.local ファイルを作成し、以下を設定してください。
          </p>
          <ul className="space-y-3">
            {CHECKLIST.map((item) => (
              <li key={item.label} className="space-y-0.5">
                <code className="text-sm font-mono font-bold text-gray-800">{item.label}</code>
                <p className="text-xs text-gray-400 ml-1">{item.hint}</p>
              </li>
            ))}
          </ul>

          <div className="bg-gray-50 rounded-xl p-4 text-xs font-mono text-gray-600 leading-relaxed">
            <p className="font-semibold text-gray-500 mb-2"># .env.local の例</p>
            <p>GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com</p>
            <p>GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx</p>
            <p>NEXTAUTH_SECRET=（openssl rand -base64 32 の出力）</p>
            <p>NEXTAUTH_URL=http://localhost:3000</p>
            <p>CLAUDE_API_KEY=sk-ant-xxxxx</p>
          </div>

          <p className="text-xs text-gray-400">
            Google OAuth リダイレクト URI:{" "}
            <code className="bg-gray-100 px-1 rounded">
              http://localhost:3000/api/auth/callback/google
            </code>
          </p>
        </div>

        <Link
          href="/"
          className="block text-center py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          ログインページへ戻る
        </Link>
      </div>
    </div>
  );
}
