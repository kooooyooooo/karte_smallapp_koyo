-- Trainers Log Database Schema
-- このSQLファイルをSupabase SQL Editorで実行してください

-- ===========================
-- players テーブル（選手マスタ）
-- ===========================
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    team TEXT,
    number TEXT
);

-- players テーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_players_user_id ON players(user_id);
CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);

-- ===========================
-- charts テーブル（カルテ）
-- ===========================
CREATE TABLE IF NOT EXISTS charts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    date DATE NOT NULL,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    status TEXT NOT NULL,
    subjective TEXT,
    objective TEXT,
    assessment TEXT,
    plan_text TEXT,
    treatments TEXT[]
);

-- charts テーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_charts_player_id ON charts(player_id);
CREATE INDEX IF NOT EXISTS idx_charts_user_id ON charts(user_id);
CREATE INDEX IF NOT EXISTS idx_charts_date ON charts(date DESC);

-- ===========================
-- Row Level Security (RLS) の設定
-- ===========================
-- MVP版ではログイン機能を実装しないため、RLSはコメントアウト
-- 将来的に認証機能を実装する際に有効化してください

-- ALTER TABLE players ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE charts ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view their own players"
--     ON players FOR SELECT
--     USING (auth.uid() = user_id);

-- CREATE POLICY "Users can insert their own players"
--     ON players FOR INSERT
--     WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users can update their own players"
--     ON players FOR UPDATE
--     USING (auth.uid() = user_id);

-- CREATE POLICY "Users can delete their own players"
--     ON players FOR DELETE
--     USING (auth.uid() = user_id);

-- CREATE POLICY "Users can view their own charts"
--     ON charts FOR SELECT
--     USING (auth.uid() = user_id);

-- CREATE POLICY "Users can insert their own charts"
--     ON charts FOR INSERT
--     WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users can update their own charts"
--     ON charts FOR UPDATE
--     USING (auth.uid() = user_id);

-- CREATE POLICY "Users can delete their own charts"
--     ON charts FOR DELETE
--     USING (auth.uid() = user_id);

-- ===========================
-- サンプルデータ（開発・テスト用）
-- ===========================
-- 仮のユーザーID
DO $$
DECLARE
    test_user_id UUID := '00000000-0000-0000-0000-000000000000';
    player1_id UUID;
    player2_id UUID;
    player3_id UUID;
BEGIN
    -- サンプル選手の挿入
    INSERT INTO players (id, user_id, name, team, number)
    VALUES 
        (gen_random_uuid(), test_user_id, '山田 太郎', 'Aチーム', '10'),
        (gen_random_uuid(), test_user_id, '佐藤 花子', 'Aチーム', '7'),
        (gen_random_uuid(), test_user_id, '田中 次郎', 'Bチーム', '15')
    RETURNING id INTO player1_id;

    -- 最初の選手IDを取得
    SELECT id INTO player1_id FROM players WHERE name = '山田 太郎' LIMIT 1;
    SELECT id INTO player2_id FROM players WHERE name = '佐藤 花子' LIMIT 1;
    SELECT id INTO player3_id FROM players WHERE name = '田中 次郎' LIMIT 1;

    -- サンプルカルテの挿入
    INSERT INTO charts (user_id, date, player_id, status, subjective, objective, assessment, plan_text, treatments)
    VALUES 
        (
            test_user_id,
            CURRENT_DATE - 7,
            player1_id,
            '別メニュー',
            '右膝外側の痛み。3日前のダッシュ練習中に発生。',
            '腸脛靭帯部に圧痛あり。腫脹なし。屈曲90度で痛み。NRS 5/10。',
            '腸脛靭帯炎の疑い。',
            'アイシング継続。ストレッチ指導。3日後に再評価。',
            ARRAY['アイシング', 'ストレッチ指導']
        ),
        (
            test_user_id,
            CURRENT_DATE - 3,
            player1_id,
            '一部参加',
            '右膝の痛みは軽減。動き始めに少し違和感あり。',
            '圧痛軽減。可動域制限なし。NRS 2/10。',
            '改善傾向。段階的に運動強度を上げていく。',
            '軽いジョギングから開始。痛みが出たら中止。',
            ARRAY['ストレッチ指導', '可動域訓練']
        ),
        (
            test_user_id,
            CURRENT_DATE,
            player1_id,
            '完全合流',
            '痛みはほぼなし。通常練習に復帰希望。',
            '圧痛なし。可動域正常。NRS 0/10。',
            '回復良好。全体練習復帰可。',
            '練習後アイシング推奨。予防的ストレッチ継続。',
            ARRAY['ストレッチ指導']
        ),
        (
            test_user_id,
            CURRENT_DATE - 1,
            player2_id,
            '見学',
            '左足首の捻挫。昨日の試合中に発生。',
            '前距腓靭帯部に圧痛・腫脹あり。背屈制限あり。NRS 7/10。',
            '左足関節内反捻挫（中等度）。',
            'RICE処置。3日間は安静。専門医受診を推奨。',
            ARRAY['アイシング', 'テーピング']
        );
END $$;
