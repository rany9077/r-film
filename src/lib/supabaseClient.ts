import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export let supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
    // SSR 환경에서는 null
    if (typeof window === "undefined") return null;

    if (supabase) return supabase;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.error("[Supabase] 환경변수 누락", {
            url: SUPABASE_URL,
            key: SUPABASE_ANON_KEY ? "exists" : "missing",
        });
        return null;
    }

    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            persistSession: true,
        },
    });

    // ✅ 마지막에 항상 반환
    return supabase;
}
