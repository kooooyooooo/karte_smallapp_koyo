"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase, Player } from "@/lib/supabase";
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

function NewChartForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPlayerId = searchParams.get("playerId");

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    player_id: initialPlayerId || "",
    status: "完全合流",
    subjective: "",
    objective: "",
    assessment: "",
    plan_text: "",
    treatments: [] as string[],
  });

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order("name");

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error("Error fetching players:", error);
      alert("選手データの取得に失敗しました");
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
    setLoading(true);

    try {
      if (!formData.player_id) {
        alert("選手を選択してください");
        return;
      }

      const { error } = await supabase.from("charts").insert([
        {
          date: formData.date,
          player_id: formData.player_id,
          status: formData.status,
          subjective: formData.subjective || null,
          objective: formData.objective || null,
          assessment: formData.assessment || null,
          plan_text: formData.plan_text || null,
          treatments: formData.treatments.length > 0 ? formData.treatments : null,
          user_id: "00000000-0000-0000-0000-000000000000", // 仮のユーザーID
        },
      ]);

      if (error) throw error;

      alert("カルテを登録しました");
      router.push(`/players/${formData.player_id}`);
    } catch (error) {
      console.error("Error saving chart:", error);
      alert("カルテの保存に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-green-600 text-white p-4 shadow-md">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">新規カルテ入力</h1>
              <p className="text-sm">SOAP形式でカルテを記録</p>
            </div>
            <Link href="/" className="text-white hover:underline">
              ← ホーム
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-4xl mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 日付 */}
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

          {/* 選手名 */}
          <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-md">
            <label className="block text-gray-700 font-bold mb-2">
              選手名 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.player_id}
              onChange={(e) =>
                setFormData({ ...formData, player_id: e.target.value })
              }
              required
              className="w-full border-2 border-gray-300 rounded-lg p-3 text-lg"
            >
              <option value="">選手を選択してください</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                  {player.number && ` (${player.number})`}
                  {player.team && ` - ${player.team}`}
                </option>
              ))}
            </select>
          </div>

          {/* ステータス */}
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

          {/* S: 主観的症状 */}
          <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-md">
            <label className="block text-gray-700 font-bold mb-2">
              S（主観的症状）
            </label>
            <p className="text-sm text-gray-600 mb-2">
              選手の訴え、痛みの部位、発症時期など
            </p>
            <textarea
              value={formData.subjective}
              onChange={(e) =>
                setFormData({ ...formData, subjective: e.target.value })
              }
              rows={4}
              className="w-full border-2 border-gray-300 rounded-lg p-3"
              placeholder="例：右足首内側の痛み。昨日の練習中にジャンプ着地時に発生。"
            />
          </div>

          {/* O: 客観的評価 */}
          <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-md">
            <label className="block text-gray-700 font-bold mb-2">
              O（客観的評価）
            </label>
            <p className="text-sm text-gray-600 mb-2">
              発生機序、痛みの度合い、可動域、所見など
            </p>
            <textarea
              value={formData.objective}
              onChange={(e) =>
                setFormData({ ...formData, objective: e.target.value })
              }
              rows={4}
              className="w-full border-2 border-gray-300 rounded-lg p-3"
              placeholder="例：前距腓靭帯部に圧痛あり。腫脹軽度。背屈可動域制限なし。NRS 3/10。"
            />
          </div>

          {/* A: 評価 */}
          <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-md">
            <label className="block text-gray-700 font-bold mb-2">
              A（評価）
            </label>
            <p className="text-sm text-gray-600 mb-2">
              トレーナーによる評価・判断
            </p>
            <textarea
              value={formData.assessment}
              onChange={(e) =>
                setFormData({ ...formData, assessment: e.target.value })
              }
              rows={4}
              className="w-full border-2 border-gray-300 rounded-lg p-3"
              placeholder="例：右足関節内反捻挫（軽度）。Grade I 程度と判断。"
            />
          </div>

          {/* P: 処置内容 */}
          <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-md">
            <label className="block text-gray-700 font-bold mb-2">
              P（処置内容）
            </label>
            <p className="text-sm text-gray-600 mb-2">
              実施した処置を選択してください（複数選択可）
            </p>
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

          {/* P: リハビリ・指導内容 */}
          <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-md">
            <label className="block text-gray-700 font-bold mb-2">
              P（リハビリ・指導内容）
            </label>
            <p className="text-sm text-gray-600 mb-2">
              リハビリメニューや今後の計画など
            </p>
            <textarea
              value={formData.plan_text}
              onChange={(e) =>
                setFormData({ ...formData, plan_text: e.target.value })
              }
              rows={4}
              className="w-full border-2 border-gray-300 rounded-lg p-3"
              placeholder="例：3日間アイシング継続。痛みが軽減すれば、軽いジョギングから開始。"
            />
          </div>

          {/* 送信ボタン */}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-500 text-white py-4 px-6 rounded-lg hover:bg-green-600 font-bold text-lg disabled:bg-gray-400"
            >
              {loading ? "保存中..." : "カルテを登録"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-300 text-gray-700 py-4 px-6 rounded-lg hover:bg-gray-400 font-bold"
            >
              キャンセル
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function NewChartPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">読み込み中...</div>}>
      <NewChartForm />
    </Suspense>
  );
}
