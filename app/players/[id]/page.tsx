"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase, Player, Chart } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default function PlayerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const playerId = params.id as string;

  const [player, setPlayer] = useState<Player | null>(null);
  const [charts, setCharts] = useState<Chart[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlayerAndCharts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId]);

  const fetchPlayerAndCharts = async () => {
    try {
      // 選手情報取得
      const { data: playerData, error: playerError } = await supabase
        .from("players")
        .select("*")
        .eq("id", playerId)
        .single();

      if (playerError) throw playerError;
      setPlayer(playerData);

      // カルテ情報取得（時系列順：新しい順）
      const { data: chartsData, error: chartsError } = await supabase
        .from("charts")
        .select("*")
        .eq("player_id", playerId)
        .order("date", { ascending: false });

      if (chartsError) throw chartsError;
      setCharts(chartsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (chartId: string) => {
    if (!confirm("このカルテを削除してもよろしいですか？")) return;

    try {
      const { error } = await supabase
        .from("charts")
        .delete()
        .eq("id", chartId);

      if (error) throw error;
      alert("カルテを削除しました");
      fetchPlayerAndCharts();
    } catch (error) {
      console.error("Error deleting chart:", error);
      alert("カルテの削除に失敗しました");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "完全合流":
        return "bg-green-100 text-green-800 border-green-300";
      case "一部参加":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "別メニュー":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "見学":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>選手が見つかりません</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-purple-600 text-white p-4 shadow-md">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">{player.name}</h1>
            <Link href="/players" className="text-white hover:underline">
              ← 選手一覧
            </Link>
          </div>
          <div className="text-sm">
            {player.team && <span>所属: {player.team}</span>}
            {player.number && <span className="ml-4">背番号: {player.number}</span>}
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-4xl mx-auto w-full">
        <div className="mb-4">
          <Link
            href={`/charts/new?playerId=${playerId}`}
            className="block w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 font-bold text-center"
          >
            ＋ 新規カルテ入力
          </Link>
        </div>

        <h2 className="text-xl font-bold mb-4">カルテ履歴（時系列）</h2>

        {charts.length === 0 ? (
          <div className="bg-white border-2 border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500">カルテがまだ登録されていません</p>
            <p className="text-gray-400 text-sm mt-2">
              上のボタンから新規カルテを入力してください
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {charts.map((chart) => (
              <div
                key={chart.id}
                className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-md"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-lg">
                        {formatDate(chart.date)}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${getStatusColor(
                          chart.status
                        )}`}
                      >
                        {chart.status}
                      </span>
                    </div>

                    {chart.subjective && (
                      <div className="mb-2">
                        <span className="font-bold text-sm text-gray-600">
                          S（主観的症状）:
                        </span>
                        <p className="text-gray-700 text-sm mt-1">
                          {chart.subjective.length > 100
                            ? chart.subjective.substring(0, 100) + "..."
                            : chart.subjective}
                        </p>
                      </div>
                    )}

                    {chart.treatments && chart.treatments.length > 0 && (
                      <div className="mb-2">
                        <span className="font-bold text-sm text-gray-600">
                          処置:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {chart.treatments.map((treatment, idx) => (
                            <span
                              key={idx}
                              className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                            >
                              {treatment}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <Link
                    href={`/charts/${chart.id}`}
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 text-center text-sm font-bold"
                  >
                    詳細・編集
                  </Link>
                  <button
                    onClick={() => handleDelete(chart.id)}
                    className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 text-sm font-bold"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
