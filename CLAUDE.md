# Synapse

グループ共同知キュレーションアプリ。メンバーの興味・思考を学習しながら、AIが未知の情報を届け、ソクラテス式対話で深い理解を促す。

## スタック

| レイヤー | 技術 |
|----------|------|
| フロントエンド | Next.js (App Router) + TypeScript + React |
| 認証 | Google OAuth (NextAuth.js) |
| AI | Claude API（Web検索ツール付き） |
| ストレージ（プロト） | Vercel KV またはローカルストレージ |
| ストレージ（本番） | DB（未定） |
| ホスティング | Vercel |

## ディレクトリ構成

```
app/
  api/
    auth/[...nextauth]/   # Google OAuth
    curate/               # AIキュレーション
    dialogue/             # ソクラテス式問い生成
    feedback/             # 統合フィードバック生成
  (app)/
    home/                 # コンテンツフィード
    content/[contentId]/  # 対話ページ（AIキュレーション・メンバー投稿共通）
    group/[groupId]/      # グループ管理
    settings/             # プロフィール・関心領域設定
components/
  auth/
  content/
  dialogue/
  group/
lib/
  claude.ts               # Claude APIクライアント
  memory.ts               # メモリ読み書き（抽象化レイヤー）
  auth.ts                 # NextAuth設定
types/
  index.ts                # Content / Member / Group / Memory 型定義
```

## 重要ルール

- **Claude APIキーはサーバーサイドのみ**：`app/api/` 内でのみ呼び出す。クライアントコンポーネントに渡さない
- **メモリは `lib/memory.ts` 経由**：将来のDB移行に備え、直接ストレージを操作しない
- **回答前は他メンバーの回答を非表示**：`AnswerInput.tsx` で送信前に他者回答を見せない設計を維持する
- **コンテンツルートは共通化**：AIキュレーションもメンバー投稿も `content/[contentId]` の同一フローに流す

## 環境変数

```
CLAUDE_API_KEY
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
NEXTAUTH_SECRET
NEXTAUTH_URL
```

## コアループ（優先実装順）

1. Googleログイン
2. AIがトピックを1件キュレーション → `home/` に表示
3. メンバーが問いに回答入力（他者回答は送信後に公開）
4. 全員回答後、AIが統合フィードバックを生成
5. メモリ蓄積 → 次回キュレーション精度向上

## 統合フィードバックの構成（要件より）

1. **共通点**：全回答に共通する認識・前提
2. **相違点**：対立軸・視点の違い（優劣判断なし）
3. **気づきの提示**：相違点の背景にある概念・理論をAIが補足
4. **次の問い**：さらに深く考えるための新しい問いを1つ

## 開発フェーズ

- **プロトタイプ**：`home/` → `content/[contentId]/` の1ルートのみ。グループIDはハードコード固定
- **Web アプリ化**：メモリ蓄積、グループ招待、Vercel デプロイ
