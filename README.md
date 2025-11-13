# トレーナーズ・ログ (Trainer's Log)

アスレチックトレーナー向けカルテ管理アプリケーション（MVP版）

## 📋 概要

トレーナーズ・ログは、アスレチックトレーナーが選手のコンディションや怪我の記録（カルテ）を効率的に管理するためのWebアプリケーションです。

### 主な機能

- **選手管理**: 選手の基本情報（氏名、所属チーム、背番号）の登録・編集・削除
- **カルテ入力**: SOAP形式でのカルテ記録（スマートフォン対応）
- **時系列閲覧**: 選手別のカルテ履歴を時系列で表示

## 📚 ドキュメント

- **[要求定義書](./docs/要求定義書.md)** - プロジェクトの背景、目的、MVP目標
- **[要件定義書](./docs/要件定義書.md)** - システム構成、データモデル、画面設計
- **[機能仕様書](./docs/機能仕様書.md)** - 画面別の詳細仕様、データ操作、バリデーション
- **[デプロイガイド](./DEPLOYMENT.md)** - Supabase・Vercelへのデプロイ手順

## 🚀 技術スタック

- **フロントエンド**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **バックエンド**: Supabase (PostgreSQL + REST API)
- **デプロイ**: Vercel

## 📦 セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd webapp
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com/)にアクセスし、新規プロジェクトを作成
2. プロジェクトの設定から以下の情報を取得:
   - Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
   - API Key - anon public (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### 4. データベースのセットアップ

1. Supabaseダッシュボードの「SQL Editor」を開く
2. `supabase/schema.sql`ファイルの内容をコピー＆ペースト
3. 「Run」をクリックしてスキーマを作成

### 5. 環境変数の設定

`.env.local`ファイルを作成し、以下の内容を設定:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 6. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認できます。

## 📱 使い方

### 選手の登録

1. トップページから「選手管理」をクリック
2. 「＋ 新規選手登録」ボタンをクリック
3. 選手名、所属チーム、背番号を入力して「登録」

### カルテの入力

1. トップページから「カルテ入力」をクリック、または選手詳細ページから「＋ 新規カルテ入力」をクリック
2. 必須項目（日付、選手名、ステータス）を入力
3. SOAP形式で情報を入力:
   - **S（主観的症状）**: 選手の訴え
   - **O（客観的評価）**: トレーナーの観察所見
   - **A（評価）**: 総合的な評価
   - **P（計画・処置）**: 処置内容とリハビリ計画
4. 「カルテを登録」をクリック

### カルテの閲覧

1. 「選手管理」から選手を選択
2. 選手詳細ページでカルテ履歴が時系列（新しい順）で表示される
3. 各カルテの「詳細・編集」ボタンで詳細を確認・編集可能

## 🏗️ プロジェクト構造

```
webapp/
├── app/
│   ├── page.tsx              # トップページ
│   ├── layout.tsx            # レイアウト
│   ├── globals.css           # グローバルスタイル
│   ├── players/
│   │   ├── page.tsx          # 選手一覧・管理
│   │   └── [id]/
│   │       └── page.tsx      # 選手詳細・カルテ履歴
│   └── charts/
│       ├── new/
│       │   └── page.tsx      # カルテ新規入力
│       └── [id]/
│           └── page.tsx      # カルテ詳細・編集
├── docs/
│   ├── 要求定義書.md          # プロジェクト要求定義
│   ├── 要件定義書.md          # システム要件定義
│   └── 機能仕様書.md          # 機能詳細仕様
├── lib/
│   └── supabase.ts           # Supabaseクライアント設定
├── supabase/
│   └── schema.sql            # データベーススキーマ
├── DEPLOYMENT.md             # デプロイガイド
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## 🔒 セキュリティ

MVP版では認証機能は実装していません。将来的にSupabase Authを使用してユーザー認証とRow Level Security (RLS)を実装する予定です。

## 🚧 今後の拡張機能（Phase 2）

- ユーザー認証・ログイン機能
- 人体イラストでの部位選択
- チーム全体の怪我傾向分析
- データのエクスポート（PDF、CSV）
- リハビリ動画・写真の添付
- 音声入力対応

## 📄 ライセンス

MIT License

## 👤 作成者

Athletic Trainer
