"use client";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    User,
    setPersistence,
    browserLocalPersistence,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

type Ctx = {
    user: User | null;
    loading: boolean;
    initialized: boolean;
    signInWithGoogleAction: () => Promise<void>;
    signOutAction: () => Promise<void>;
};

const AuthContext = createContext<Ctx | undefined>(undefined);

// === 설정값 & 키 ===
const AUTO_LOGOUT_MS = 2 * 60 * 60 * 1000; // 2시간
const LS_KEY_LOGIN_AT = "auth:loginAt";    // 로그인 기준 시각 (epoch ms)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);

    // 탭 전체 동기화를 위한 타이머, 정리용 ref
    const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // --- 타이머 관리 도우미 ---
    const clearLogoutTimer = () => {
        if (logoutTimerRef.current) {
            clearTimeout(logoutTimerRef.current);
            logoutTimerRef.current = null;
        }
    };

    const scheduleAutoLogout = () => {
        clearLogoutTimer();
        const loginAtStr = localStorage.getItem(LS_KEY_LOGIN_AT);
        if (!loginAtStr) return; // 로그인 시각이 없으면 스케줄 불가

        const loginAt = Number(loginAtStr);
        const elapsed = Date.now() - loginAt;
        const remain = AUTO_LOGOUT_MS - elapsed;

        if (remain <= 0) {
            // 이미 만료
            signOutAction();
            return;
        }

        logoutTimerRef.current = setTimeout(() => {
            signOutAction();
        }, remain);
    };

    useEffect(() => {
        setPersistence(auth, browserLocalPersistence).catch(() => {});
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setInitialized(true);

            // 사용자 존재 → 로그인 세션 체크 & 타이머 세팅
            if (u) {
                // 로그인 시각이 없다면(첫 진입/리프레시) 지금 시각을 채운다
                if (!localStorage.getItem(LS_KEY_LOGIN_AT)) {
                    localStorage.setItem(LS_KEY_LOGIN_AT, String(Date.now()));
                }
                scheduleAutoLogout();
            } else {
                // 로그아웃 시 정리
                clearLogoutTimer();
                localStorage.removeItem(LS_KEY_LOGIN_AT);
            }
        });
        return () => {
            unsub();
            clearLogoutTimer();
        };
    }, []);

    // 탭 간 동기화를 위해 storage 이벤트 수신 (다른 탭에서 로그아웃/로그인 시각 갱신 시 반영)
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === LS_KEY_LOGIN_AT) {
                // 다른 탭에서 로그인(시각 갱신)하거나 로그아웃(키 제거) 했을 때 재스케줄
                if (auth.currentUser && localStorage.getItem(LS_KEY_LOGIN_AT)) {
                    scheduleAutoLogout();
                } else {
                    clearLogoutTimer();
                }
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    const signInWithGoogleAction = async () => {
        setLoading(true);
        try {
            await signInWithPopup(auth, googleProvider);
            // 팝업 성공 직후 로그인 기준 시각을 현재로 리셋 (재로그인 시 세션 갱신)
            localStorage.setItem(LS_KEY_LOGIN_AT, String(Date.now()));
            scheduleAutoLogout();
        } finally {
            setLoading(false);
        }
    };

    const signOutAction = async () => {
        setLoading(true);
        try {
            await signOut(auth);
        } finally {
            setLoading(false);
            clearLogoutTimer();
            localStorage.removeItem(LS_KEY_LOGIN_AT);
        }
    };

    const value = useMemo(
        () => ({ user, loading, initialized, signInWithGoogleAction, signOutAction }),
        [user, loading, initialized]
    );

    return (
        <AuthContext.Provider value={value}>
            {/* 초기 로딩 중엔 전체 스피너 표시 */}
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
