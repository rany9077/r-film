// src/app/auth/callback/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const supabase = getSupabaseClient();
        if (!supabase) return;

        const run = async () => {
            // SDK가 알아서 세션 교환을 처리했을 것이라 가정
            const { data } = await supabase.auth.getSession();
            const session = data.session;

            if (!session) {
                // 실패 처리
                alert("로그인 세션 생성에 실패했습니다. 다시 시도해주세요.");
                router.replace("/");
                return;
            }

            // 성공 → 관리자 페이지 등으로 이동
            router.replace("/admin/inquiries");
        };

        void run();
    }, [router]);

    return (
        <main className="min-h-[60vh] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
        </main>
    );
}
