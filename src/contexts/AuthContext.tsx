"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabaseClient";

type Ctx = {
    user: SupabaseUser | null;
    loading: boolean;
    initialized: boolean;
    signInWithGoogleAction: () => Promise<void>;
    signOutAction: () => Promise<void>;
};

const AuthContext = createContext<Ctx | undefined>(undefined);

// === 설정값 & 키 ===
const AUTO_LOGOUT_MS = 2 * 60 * 60 * 1000; // 2시간
const LS_KEY_LOGIN_AT = "auth:loginAt";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);

    const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearLogoutTimer = () => {
        if (logoutTimerRef.current) {
            clearTimeout(logoutTimerRef.current);
            logoutTimerRef.current = null;
        }
    };

    const signOutAction = async () => {
        const supabase = getSupabaseClient();
        if (!supabase) {
            clearLogoutTimer();
            localStorage.removeItem(LS_KEY_LOGIN_AT);
            setUser(null);
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error("[Auth] signOut error", error);
            }
        } finally {
            setLoading(false);
            clearLogoutTimer();
            localStorage.removeItem(LS_KEY_LOGIN_AT);
            setUser(null);
        }
    };

    const scheduleAutoLogout = () => {
        clearLogoutTimer();
        const loginAtStr = localStorage.getItem(LS_KEY_LOGIN_AT);
        if (!loginAtStr) return;

        const loginAt = Number(loginAtStr);
        const elapsed = Date.now() - loginAt;
        const remain = AUTO_LOGOUT_MS - elapsed;

        if (remain <= 0) {
            void signOutAction();
            return;
        }

        logoutTimerRef.current = setTimeout(() => {
            void signOutAction();
        }, remain);
    };

    // 초기 세션 + 상태 구독
    useEffect(() => {
        const supabase = getSupabaseClient();
        if (!supabase) {
            setInitialized(true);
            return;
        }

        let cancelled = false;

        const initAuth = async () => {
            // ✅ 세션 먼저 확인 (세션이 없어도 에러 안 남)
            const { data, error } = await supabase.auth.getSession();
            if (error) {
                console.error("[Auth] getSession error", error);
            }

            if (cancelled) return;

            const session = data.session ?? null;
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            setInitialized(true);

            if (currentUser) {
                if (!localStorage.getItem(LS_KEY_LOGIN_AT)) {
                    localStorage.setItem(LS_KEY_LOGIN_AT, String(Date.now()));
                }
                scheduleAutoLogout();
            } else {
                clearLogoutTimer();
                localStorage.removeItem(LS_KEY_LOGIN_AT);
            }
        };

        void initAuth();

        // 이후 상태 변화는 onAuthStateChange에서 처리
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                if (!localStorage.getItem(LS_KEY_LOGIN_AT)) {
                    localStorage.setItem(LS_KEY_LOGIN_AT, String(Date.now()));
                }
                scheduleAutoLogout();
            } else {
                clearLogoutTimer();
                localStorage.removeItem(LS_KEY_LOGIN_AT);
            }
        });

        return () => {
            cancelled = true;
            subscription.unsubscribe();
            clearLogoutTimer();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 탭 동기화
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === LS_KEY_LOGIN_AT) {
                if (localStorage.getItem(LS_KEY_LOGIN_AT)) {
                    scheduleAutoLogout();
                } else {
                    clearLogoutTimer();
                }
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const signInWithGoogleAction = async () => {
        const supabase = getSupabaseClient();
        if (!supabase) {
            console.error("[Auth] Supabase client not available");
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                console.error("[Auth] signInWithGoogle error", error);
                alert("로그인에 실패했습니다. 잠시 후 다시 시도해주세요.");
            }
            // 세션 저장은 /auth/callback + onAuthStateChange에서 처리
        } finally {
            setLoading(false);
        }
    };

    const value = useMemo(
        () => ({ user, loading, initialized, signInWithGoogleAction, signOutAction }),
        [user, loading, initialized]
    );

    return (
        <AuthContext.Provider value={value}>
            {!initialized ? (
                <div className="fixed inset-0 flex items-center justify-center bg-white">
                    <div className="w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
