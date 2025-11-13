import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">トレーナーズ・ログ</h1>
        <p className="text-sm">アスレチックトレーナー向けカルテ管理</p>
      </header>

      <main className="flex-1 p-4 max-w-4xl mx-auto w-full">
        <div className="grid gap-4 md:grid-cols-2">
          <Link 
            href="/players" 
            className="bg-white border-2 border-blue-500 rounded-lg p-6 hover:bg-blue-50 transition-colors shadow-md"
          >
            <h2 className="text-xl font-bold text-blue-600 mb-2">選手管理</h2>
            <p className="text-gray-600">選手の登録・編集・削除</p>
          </Link>

          <Link 
            href="/charts/new" 
            className="bg-white border-2 border-green-500 rounded-lg p-6 hover:bg-green-50 transition-colors shadow-md"
          >
            <h2 className="text-xl font-bold text-green-600 mb-2">カルテ入力</h2>
            <p className="text-gray-600">新規カルテの記録</p>
          </Link>

          <Link 
            href="/players" 
            className="bg-white border-2 border-purple-500 rounded-lg p-6 hover:bg-purple-50 transition-colors shadow-md"
          >
            <h2 className="text-xl font-bold text-purple-600 mb-2">カルテ検索</h2>
            <p className="text-gray-600">選手別時系列閲覧</p>
          </Link>
        </div>
      </main>

      <footer className="bg-gray-100 p-4 text-center text-gray-600 text-sm">
        <p>© 2024 Trainer&apos;s Log</p>
      </footer>
    </div>
  );
}
