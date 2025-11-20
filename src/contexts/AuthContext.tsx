"use client";
import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    User,
    setPersistence,
    browserLocalPersistence,
} from "firebase/auth";
import { getAuthInstance, getGoogleProvider } from "@/lib/firebase";

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
const LS_KEY_LOGIN_AT = "auth:loginAt"; // 로그인 기준 시각 (epoch ms)

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
        if (!loginAtStr) return;

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

    // 초기 auth 상태 구독
    useEffect(() => {
        const auth = getAuthInstance();
        if (!auth) {
            // 브라우저가 아니거나 Firebase 초기화 실패
            setInitialized(true);
            return;
        }

        setPersistence(auth, browserLocalPersistence).catch(() => {});

        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setInitialized(true);

            if (u) {
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
            unsub();
            clearLogoutTimer();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 탭 간 동기화를 위해 storage 이벤트 수신
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === LS_KEY_LOGIN_AT) {
                const auth = getAuthInstance();
                if (!auth) {
                    clearLogoutTimer();
                    return;
                }

                if (auth.currentUser && localStorage.getItem(LS_KEY_LOGIN_AT)) {
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
        const auth = getAuthInstance();
        const provider = getGoogleProvider();

        if (!auth || !provider) {
            console.error("[Auth] Auth or GoogleProvider not available");
            return;
        }

        setLoading(true);
        try {
            await signInWithPopup(auth, provider);
            localStorage.setItem(LS_KEY_LOGIN_AT, String(Date.now()));
            scheduleAutoLogout();
        } finally {
            setLoading(false);
        }
    };

    const signOutAction = async () => {
        const auth = getAuthInstance();
        if (!auth) {
            clearLogoutTimer();
            localStorage.removeItem(LS_KEY_LOGIN_AT);
            return;
        }

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
