// Client Supabase — mode réel si les variables d'env sont présentes, sinon mode démo.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const IS_DEMO = !url || !key;

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (IS_DEMO) return null;
  if (!client) {
    client = createClient(url!, key!, {
      realtime: { params: { eventsPerSecond: 5 } },
    });
  }
  return client;
}
