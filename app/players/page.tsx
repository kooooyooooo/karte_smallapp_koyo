"use client";

import { useState, useEffect } from "react";
import { supabase, Player } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    team: "",
    number: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        // 更新
        const { error } = await supabase
          .from("players")
          .update({
            name: formData.name,
            team: formData.team || null,
            number: formData.number || null,
          })
          .eq("id", editingId);

        if (error) throw error;
        alert("選手情報を更新しました");
      } else {
        // 新規作成
        const { error } = await supabase.from("players").insert([
          {
            name: formData.name,
            team: formData.team || null,
            number: formData.number || null,
            user_id: "00000000-0000-0000-0000-000000000000", // 仮のユーザーID（認証実装後に変更）
          },
        ]);

        if (error) throw error;
        alert("選手を登録しました");
      }

      setFormData({ name: "", team: "", number: "" });
      setEditingId(null);
      setShowForm(false);
      fetchPlayers();
    } catch (error) {
      console.error("Error saving player:", error);
      alert("選手の保存に失敗しました");
    }
  };

  const handleEdit = (player: Player) => {
    setFormData({
      name: player.name,
      team: player.team || "",
      number: player.number || "",
    });
    setEditingId(player.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この選手を削除してもよろしいですか？")) return;

    try {
      const { error } = await supabase.from("players").delete().eq("id", id);

      if (error) throw error;
      alert("選手を削除しました");
      fetchPlayers();
    } catch (error) {
      console.error("Error deleting player:", error);
      alert("選手の削除に失敗しました");
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", team: "", number: "" });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold">選手管理</h1>
            <p className="text-sm">選手の登録・編集・削除</p>
          </div>
          <Link href="/" className="text-white hover:underline">
            ← ホーム
          </Link>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-4xl mx-auto w-full">
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full bg-green-500 text-white py-3 px-4 rounded-lg mb-4 hover:bg-green-600 font-bold"
        >
          {showForm ? "閉じる" : "＋ 新規選手登録"}
        </button>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white border-2 border-gray-300 rounded-lg p-4 mb-4 shadow-md"
          >
            <h2 className="text-xl font-bold mb-4">
              {editingId ? "選手情報編集" : "新規選手登録"}
            </h2>

            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">
                選手名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="w-full border-2 border-gray-300 rounded-lg p-2"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">
                所属チーム
              </label>
              <input
                type="text"
                value={formData.team}
                onChange={(e) =>
                  setFormData({ ...formData, team: e.target.value })
                }
                className="w-full border-2 border-gray-300 rounded-lg p-2"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">
                背番号
              </label>
              <input
                type="text"
                value={formData.number}
                onChange={(e) =>
                  setFormData({ ...formData, number: e.target.value })
                }
                className="w-full border-2 border-gray-300 rounded-lg p-2"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 font-bold"
              >
                {editingId ? "更新" : "登録"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 font-bold"
              >
                キャンセル
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {players.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              選手が登録されていません
            </p>
          ) : (
            players.map((player) => (
              <div
                key={player.id}
                className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-md"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{player.name}</h3>
                    {player.team && (
                      <p className="text-gray-600 text-sm">
                        所属: {player.team}
                      </p>
                    )}
                    {player.number && (
                      <p className="text-gray-600 text-sm">
                        背番号: {player.number}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/players/${player.id}`}
                      className="bg-purple-500 text-white py-1 px-3 rounded hover:bg-purple-600 text-sm"
                    >
                      カルテ
                    </Link>
                    <button
                      onClick={() => handleEdit(player)}
                      className="bg-yellow-500 text-white py-1 px-3 rounded hover:bg-yellow-600 text-sm"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(player.id)}
                      className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 text-sm"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
