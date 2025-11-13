# デプロイガイド

## Supabaseのセットアップ

### 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com/)にアクセス
2. 「New project」をクリック
3. プロジェクト名を入力（例：trainers-log）
4. データベースパスワードを設定
5. リージョンを選択（推奨：Tokyo）
6. 「Create new project」をクリック

### 2. データベーススキーマの作成

1. Supabaseダッシュボードで「SQL Editor」を開く
2. `supabase/schema.sql`ファイルの内容をコピー
3. SQL Editorに貼り付け
4. 「Run」をクリックして実行

### 3. API情報の取得

1. Supabaseダッシュボードで「Settings」→「API」を開く
2. 以下の情報をコピー:
   - Project URL
   - API Key (anon public)

## Vercelへのデプロイ

### 1. Vercelプロジェクトの作成

1. [Vercel](https://vercel.com/)にアクセス
2. 「New Project」をクリック
3. GitHubリポジトリを選択
4. フレームワークプリセット: Next.js（自動検出）

### 2. 環境変数の設定

以下の環境変数を設定:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. デプロイ

「Deploy」ボタンをクリックしてデプロイを開始

## ローカル開発環境

### 1. 環境変数の設定

`.env.local`ファイルを作成:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く

## トラブルシューティング

### ビルドエラー

```bash
npm run build
```

でビルドエラーがないか確認

### 型エラー

```bash
npx tsc --noEmit
```

で型チェックを実行

### ESLintエラー

```bash
npm run lint
```

でリントチェックを実行
