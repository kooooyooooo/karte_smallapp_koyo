"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase, Chart, Player } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = 'force-dynamic';

const STATUS_OPTIONS = ["完全合流", "一部参加", "別メニュー", "見学"];
const TREATMENT_OPTIONS = [
  "アイシング",
  "テーピング",
  "マッサージ",
  "ストレッチ指導",
  "筋力トレーニング指導",
  "可動域訓練",
  "電気療法",
  "超音波療法",
];

export default function ChartDetailPage() {
  const params = useParams();
  const router = useRouter();
  const chartId = params.id as string;

  const [chart, setChart] = useState<Chart | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    status: "",
    subjective: "",
    objective: "",
    assessment: "",
    plan_text: "",
    treatments: [] as string[],
  });

  useEffect(() => {
    fetchChartAndPlayer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartId]);

  const fetchChartAndPlayer = async () => {
    try {
      const { data: chartData, error: chartError } = await supabase
        .from("charts")
        .select("*")
        .eq("id", chartId)
        .single();

      if (chartError) throw chartError;
      setChart(chartData);

      const { data: playerData, error: playerError } = await supabase
        .from("players")
        .select("*")
        .eq("id", chartData.player_id)
        .single();

      if (playerError) throw playerError;
      setPlayer(playerData);

      // フォームデータの初期化
      setFormData({
        date: chartData.date,
        status: chartData.status,
        subjective: chartData.subjective || "",
        objective: chartData.objective || "",
        assessment: chartData.assessment || "",
        plan_text: chartData.plan_text || "",
        treatments: chartData.treatments || [],
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleTreatmentChange = (treatment: string) => {
    setFormData((prev) => {
      const treatments = prev.treatments.includes(treatment)
        ? prev.treatments.filter((t) => t !== treatment)
        : [...prev.treatments, treatment];
      return { ...prev, treatments };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from("charts")
        .update({
          date: formData.date,
          status: formData.status,
          subjective: formData.subjective || null,
          objective: formData.objective || null,
          assessment: formData.assessment || null,
          plan_text: formData.plan_text || null,
          treatments: formData.treatments.length > 0 ? formData.treatments : null,
        })
        .eq("id", chartId);

      if (error) throw error;

      alert("カルテを更新しました");
      setEditing(false);
      fetchChartAndPlayer();
    } catch (error) {
      console.error("Error updating chart:", error);
      alert("カルテの更新に失敗しました");
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (!chart || !player) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>カルテが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold">カルテ詳細</h1>
              <p className="text-sm">{player.name}</p>
            </div>
            <Link
              href={`/players/${player.id}`}
              className="text-white hover:underline"
            >
              ← 選手詳細
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-4xl mx-auto w-full">
        {!editing ? (
          // 閲覧モード
          <div className="space-y-4">
            <button
              onClick={() => setEditing(true)}
              className="w-full bg-yellow-500 text-white py-3 px-4 rounded-lg hover:bg-yellow-600 font-bold"
            >
              編集する
            </button>

            <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-md">
              <h3 className="font-bold text-gray-600 mb-2">日付</h3>
              <p className="text-lg">{formatDate(chart.date)}</p>
            </div>

            <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-md">
              <h3 className="font-bold text-gray-600 mb-2">ステータス</h3>
              <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-bold">
                {chart.status}
              </span>
            </div>

            {chart.subjective && (
              <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-md">
                <h3 className="font-bold text-gray-600 mb-2">
                  S（主観的症状）
                </h3>
                <p className="whitespace-pre-wrap">{chart.subjective}</p>
              </div>
            )}

            {chart.objective && (
              <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-md">
                <h3 className="font-bold text-gray-600 mb-2">
                  O（客観的評価）
                </h3>
                <p className="whitespace-pre-wrap">{chart.objective}</p>
              </div>
            )}

            {chart.assessment && (
              <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-md">
                <h3 className="font-bold text-gray-600 mb-2">A（評価）</h3>
                <p className="whitespace-pre-wrap">{chart.assessment}</p>
              </div>
            )}

            {chart.treatments && chart.treatments.length > 0 && (
              <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-md">
                <h3 className="font-bold text-gray-600 mb-2">P（処置内容）</h3>
                <div className="flex flex-wrap gap-2">
                  {chart.treatments.map((treatment, idx) => (
                    <span
                      key={idx}
                      className="bg-green-100 text-green-800 px-3 py-1 rounded-full"
                    >
                      {treatment}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {chart.plan_text && (
              <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-md">
                <h3 className="font-bold text-gray-600 mb-2">
                  P（リハビリ・指導内容）
                </h3>
                <p className="whitespace-pre-wrap">{chart.plan_text}</p>
              </div>
            )}
          </div>
        ) : (
          // 編集モード
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-md">
              <label className="block text-gray-700 font-bold mb-2">
                日付 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
                className="w-full border-2 border-gray-300 rounded-lg p-3 text-lg"
              />
            </div>

            <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-md">
              <label className="block text-gray-700 font-bold mb-2">
                ステータス <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFormData({ ...formData, status })}
                    className={`py-3 px-4 rounded-lg font-bold transition-colors ${
                      formData.status === status
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-md">
              <label className="block text-gray-700 font-bold mb-2">
                S（主観的症状）
              </label>
              <textarea
                value={formData.subjective}
                onChange={(e) =>
                  setFormData({ ...formData, subjective: e.target.value })
                }
                rows={4}
                className="w-full border-2 border-gray-300 rounded-lg p-3"
              />
            </div>

            <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-md">
              <label className="block text-gray-700 font-bold mb-2">
                O（客観的評価）
              </label>
              <textarea
                value={formData.objective}
                onChange={(e) =>
                  setFormData({ ...formData, objective: e.target.value })
                }
                rows={4}
                className="w-full border-2 border-gray-300 rounded-lg p-3"
              />
            </div>

            <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-md">
              <label className="block text-gray-700 font-bold mb-2">
                A（評価）
              </label>
              <textarea
                value={formData.assessment}
                onChange={(e) =>
                  setFormData({ ...formData, assessment: e.target.value })
                }
                rows={4}
                className="w-full border-2 border-gray-300 rounded-lg p-3"
              />
            </div>

            <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-md">
              <label className="block text-gray-700 font-bold mb-2">
                P（処置内容）
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TREATMENT_OPTIONS.map((treatment) => (
                  <label
                    key={treatment}
                    className="flex items-center space-x-2 p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={formData.treatments.includes(treatment)}
                      onChange={() => handleTreatmentChange(treatment)}
                      className="w-5 h-5"
                    />
                    <span>{treatment}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-md">
              <label className="block text-gray-700 font-bold mb-2">
                P（リハビリ・指導内容）
              </label>
              <textarea
                value={formData.plan_text}
                onChange={(e) =>
                  setFormData({ ...formData, plan_text: e.target.value })
                }
                rows={4}
                className="w-full border-2 border-gray-300 rounded-lg p-3"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-500 text-white py-4 px-6 rounded-lg hover:bg-blue-600 font-bold text-lg"
              >
                更新
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="bg-gray-300 text-gray-700 py-4 px-6 rounded-lg hover:bg-gray-400 font-bold"
              >
                キャンセル
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
