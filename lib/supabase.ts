import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 型定義
export type Player = {
  id: string;
  created_at: string;
  user_id: string;
  name: string;
  team: string | null;
  number: string | null;
};

export type Chart = {
  id: string;
  created_at: string;
  date: string;
  player_id: string;
  user_id: string;
  status: string;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan_text: string | null;
  treatments: string[] | null;
};

export type ChartWithPlayer = Chart & {
  players: Player;
};
