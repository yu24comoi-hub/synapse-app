# Synapse

グループ共同知キュレーションアプリ。メンバーの興味・思考を学習しながら、AIが未知の情報を届け、ソクラテス式対話で深い理解を促す。

## このアプリについて

Synapseは、グループ（チーム・コミュニティ）が一緒に知を深めるためのアプリです。

**背景にある課題：**
- 個人で情報収集すると、自分の興味・バイアスの範囲から出られない
- グループで議論しても、発言力の強い人の意見に流れがち
- 「知っていること」しか話題にならず、「知らなかったこと」を共有する機会が少ない

**Synapseが提供すること：**
AIがグループの過去の関心・回答を学習し、メンバーがまだ知らない情報を自動でキュレーションします。そのトピックについて全員が各自の考えを回答し、AIが統合フィードバック（共通点・相違点・新たな気づき・次の問い）を生成します。回答は送信するまで他者には見えないため、各自が独立して考えを持ちます。

**想定ユーザー：**
定期的に集まって議論・学習をしたいチームや勉強グループ。

---

## やること・やらないこと

### やること（スコープ内）

- Googleアカウントによるログイン
- AIによるトピックキュレーション（グループの関心を学習して選定）
- トピックへの問い生成（ソクラテス式：yes/noで終わらない）
- メンバーが問いに回答（テキスト入力）
- 全回答をもとにAIが統合フィードバックを生成
- 回答履歴をメモリとして蓄積し、次回キュレーション精度を向上
- Vercel上へのWebアプリとしての公開

### やらないこと（スコープ外）

- SNS的な機能（いいね・コメント・シェア）
- リアルタイム通知・チャット
- メンバー自身によるコンテンツ手動投稿（AIキュレーションのみ）
- グループの作成・招待UI（プロトタイプはグループID固定）
- モバイルアプリ（iOS/Android ネイティブ）
- 外部サービスとの連携（Slack・Notionなど）
- コンテンツへの評価・ランキング

---

## 現在の要件

### 認証
- Googleアカウントでログイン・ログアウトができる
- ログインしていない場合、すべての画面へのアクセスをブロックする

### ホーム画面（`/home`）
- キュレーション済みトピックがカード形式で一覧表示される（新しい順）
- 「新しいトピックをキュレーション」ボタンを押すとAIがトピックと問いを生成する
- 各カードから対話ページへ遷移できる
- 自分がまだ回答していないトピックと、済みのトピックを区別できる

### 対話ページ（`/content/[contentId]`）
- トピックのタイトル・要約・問いが表示される
- 自分の回答をテキストで入力・送信できる
- **送信前は他のメンバーの回答を表示しない**（独立した思考を守る）
- 送信後は全メンバーの回答が表示される
- 「統合フィードバックを生成」ボタンでAIがフィードバックを生成する
- フィードバックは「共通点」「相違点」「気づき」「次の問い」の4項目で構成される

### AIキュレーション
- グループメンバーの過去の回答履歴を参照して、関連性の高い「未知の情報」を1件選ぶ
- タイトル（30字以内）・要約（150字以内）・参照URL・問いをJSON形式で返す
- 回答履歴がない場合は幅広いテーマから選定する
- 使用モデル：`claude-sonnet-4-6`（プロンプトキャッシュ有効）

### 統合フィードバック
- 全メンバーの回答を入力としてAIが生成する
- 構成：共通点 / 相違点 / 気づきの提示 / 次の問い（各1〜3文）
- 回答が0件の場合はエラーを返す

### メモリ蓄積
- 回答を送信するたびに、メンバーIDと回答内容を記録する
- 直近20件の回答を保持し、古いものから削除する
- 次回キュレーション時にこの履歴をClaudeに渡す
- 現在はインメモリ実装（サーバー再起動でリセット）→ 今後Upstash Redisで永続化予定

---

## スタック

| レイヤー | 技術 |
|----------|------|
| フロントエンド | Next.js 16 (App Router) + TypeScript + React 19 |
| 認証 | Google OAuth (NextAuth.js v4) |
| AI | Claude API（`claude-sonnet-4-6`、プロンプトキャッシュ付き） |
| ストレージ（現在） | インメモリ `Map`（サーバー再起動でリセット） |
| ストレージ（次フェーズ） | Upstash Redis（`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`） |
| ホスティング | Vercel（デプロイ済み） |

## ディレクトリ構成（実装済み）

```
app/
  api/
    auth/[...nextauth]/   # Google OAuth（NextAuth）
    curate/               # POST: AIキュレーション実行
    answer/               # POST: メンバー回答送信
    feedback/             # POST: 統合フィードバック生成
    content/
      route.ts            # GET: 全コンテンツ一覧
      [contentId]/
        route.ts          # GET: 単一コンテンツ取得
  (app)/
    home/                 # コンテンツフィード（Server Component）
    content/[contentId]/  # 対話ページ（Client Component、useParams使用）
    layout.tsx            # 認証ガード付きレイアウト
app/
  layout.tsx              # SessionProvider ラップ
  page.tsx                # ルート（/home へリダイレクト）
  providers.tsx           # SessionProvider

components/
  auth/LoginButton.tsx
  content/ContentCard.tsx
  content/CurateButton.tsx
  dialogue/AnswerInput.tsx
  dialogue/IntegratedFeedback.tsx
  dialogue/QuestionPrompt.tsx

lib/
  claude.ts       # curate() / generateFeedback()（プロンプトキャッシュ付き）
  memory.ts       # メンバーインタラクション履歴（インメモリ、最大20件/人）
  store.ts        # ContentSession の CRUD（インメモリ Map）
  auth.ts         # NextAuth設定（NEXTAUTH_SECRET を明示渡し）

types/index.ts    # Member / Content / Answer / Feedback / ContentSession
```

## 重要ルール

- **機能を追加・変更したら、このCLAUDE.mdの該当セクションを更新する**
- **構成（ファイル・ディレクトリ）を変えた場合は、変えた理由を一言コメントに残す**
- **Claude APIキーはサーバーサイドのみ**：`app/api/` 内でのみ呼び出す。クライアントコンポーネントに渡さない
- **ストレージは `lib/store.ts` / `lib/memory.ts` 経由**：将来のRedis移行に備え、直接操作しない
- **回答前は他メンバーの回答を非表示**：`AnswerInput.tsx` で送信前に他者回答を見せない設計を維持する
- **コンテンツルートは共通化**：AIキュレーションもメンバー投稿も `content/[contentId]` の同一フローに流す
- **Next.js 16 の動的ルートパラメータは Promise**：ルートハンドラでは `const { id } = await params` と await が必須。クライアントでは `useParams()` を使う（awaitは不要）
- **グループIDはプロトタイプ用にハードコード**：`"group-1"` 固定。グループ機能実装時に変更する

## 環境変数

```
# 必須（設定済み）
CLAUDE_API_KEY
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
NEXTAUTH_SECRET
NEXTAUTH_URL          # Vercel デプロイ URL に合わせること

# Upstash Redis（設定済み）
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

## APIエンドポイント一覧

| メソッド | パス | 認証 | 概要 |
|----------|------|------|------|
| GET | `/api/content` | 要 | 全ContentSession取得 |
| GET | `/api/content/[contentId]` | 要 | 単一ContentSession取得 |
| POST | `/api/curate` | 要 | AIキュレーション実行 → store追加 |
| POST | `/api/answer` | 要 | 回答送信 → store & memory記録 |
| POST | `/api/feedback` | 要 | 統合フィードバック生成 → store保存 |

## コアループ（優先実装順）

1. Googleログイン ✅
2. AIがトピックを1件キュレーション → `home/` に表示 ✅
3. メンバーが問いに回答入力（他者回答は送信後に公開） ✅
4. 全員回答後、AIが統合フィードバックを生成 ✅
5. メモリ蓄積 → 次回キュレーション精度向上 ✅（インメモリ実装済み）

## 統合フィードバックの構成（要件より）

1. **共通点**：全回答に共通する認識・前提
2. **相違点**：対立軸・視点の違い（優劣判断なし）
3. **気づきの提示**：相違点の背景にある概念・理論をAIが補足
4. **次の問い**：さらに深く考えるための新しい問いを1つ

## 開発フェーズ

- **プロトタイプ** ✅：`home/` → `content/[contentId]/` の1ルート。グループIDはハードコード固定。Vercelデプロイ済み
- **次フェーズ**：Upstash Redisでストレージ永続化（インメモリ→Redis置き換え）
- **将来**：グループ招待、`group/[groupId]/`、`settings/` ページ実装
