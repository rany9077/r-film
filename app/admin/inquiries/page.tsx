"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
    collection,
    doc,
    onSnapshot,
    orderBy,
    query,
    updateDoc,
    deleteDoc,
    Timestamp,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import Header from "@/components/Header";

// 관리자 UID (환경변수로 관리)
const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID;

type Inquiry = {
    id: string;
    name: string;
    phone?: string | null;
    kakaoId?: string | null;
    message: string;
    budget?: string | null;
    spaceType?: "kitchen" | "door" | "furniture" | "wall" | "etc";
    status?: "new" | "in-progress" | "done";
    createdAt?: Timestamp | string | null;
};

// Firestore Timestamp 또는 ISO string → 한국 로케일 날짜
function formatDate(v?: Timestamp | string | null) {
    try {
        if (!v) return "-";
        if (v instanceof Timestamp) return v.toDate().toLocaleString();
        const d = new Date(v);
        return isNaN(d.getTime()) ? "-" : d.toLocaleString();
    } catch {
        return "-";
    }
}

//
// ────────────────────────────────────────────────────────────────
//   메인 관리자 페이지
// ────────────────────────────────────────────────────────────────
//
export default function InquiriesAdminPage() {
    const { user, initialized } = useAuth();

    // 전체 문의 데이터
    const [rows, setRows] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);

    // 상태 필터 (전체/신규/진행중/완료)
    const [status, setStatus] = useState<"all" | NonNullable<Inquiry["status"]>>("all");

    // 검색어 필터
    const [q, setQ] = useState("");

    // 현재 로그인한 유저가 관리자 여부 판단
    const isAdmin = user?.uid === ADMIN_UID;

    //
    // ────────────────────────────────────────────────────────────────
    //   Firestore "inquiries" 실시간 구독
    // ────────────────────────────────────────────────────────────────
    //
    useEffect(() => {
        // 로그인 + 관리자일 때만 로직 실행
        if (!initialized || !isAdmin) return;

        const db = getDb();
        if (!db) {
            console.error("[InquiriesAdminPage] Firestore is not available");
            setLoading(false);
            return;
        }

        const col = collection(db, "inquiries");
        const qy = query(col, orderBy("createdAt", "desc"));

        // 실시간 구독
        const unsub = onSnapshot(
            qy,
            (snap) => {
                // 문서를 배열로 변환
                const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Inquiry[];
                setRows(list);
                setLoading(false);
            },
            (err) => {
                console.error(err);
                setLoading(false);
            }
        );
        return () => unsub();
    }, [initialized, isAdmin]);

    //
    // ────────────────────────────────────────────────────────────────
    //   필터링(상태 & 검색)
    // ────────────────────────────────────────────────────────────────
    //
    const filtered = useMemo(() => {
        let r = rows;

        // 상태 필터
        if (status !== "all") r = r.filter((x) => (x.status ?? "new") === status);

        // 검색어 필터 (이름/연락처/카카오/내용 등 포함)
        if (q.trim()) {
            const s = q.toLowerCase();
            r = r.filter((x) =>
                [x.name, x.phone ?? "", x.kakaoId ?? "", x.message, x.budget ?? "", x.spaceType ?? ""]
                    .join(" ")
                    .toLowerCase()
                    .includes(s)
            );
        }
        return r;
    }, [rows, status, q]);

    //
    // ────────────────────────────────────────────────────────────────
    //   상태 변경 / 삭제 액션
    // ────────────────────────────────────────────────────────────────
    //
    async function changeStatus(id: string, next: NonNullable<Inquiry["status"]>) {
        const db = getDb();
        if (!db) {
            console.error("[InquiriesAdminPage] Firestore is not available (changeStatus)");
            return;
        }

        await updateDoc(doc(db, "inquiries", id), { status: next });
    }

    async function remove(id: string) {
        if (!confirm("이 문의를 삭제할까요?")) return;

        const db = getDb();
        if (!db) {
            console.error("[InquiriesAdminPage] Firestore is not available (remove)");
            return;
        }

        await deleteDoc(doc(db, "inquiries", id));
    }

    //
    // ────────────────────────────────────────────────────────────────
    //   권한/초기화 상태 체크
    // ────────────────────────────────────────────────────────────────
    //
    if (!initialized) {
        return (
            <main className="max-w-5xl mx-auto px-4 py-12">
                <div className="w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
            </main>
        );
    }

    // 관리자가 아닌 경우
    if (!isAdmin) {
        return (
            <main className="max-w-5xl mx-auto px-4 py-12">
                <h2 className="text-2xl font-bold">권한 없음</h2>
                <p className="text-gray-600 mt-2">이 페이지는 관리자만 접근할 수 있습니다.</p>
            </main>
        );
    }

    return (
        <>
            <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
                {/* 상단 헤더 + 필터 */}
                <header className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl md:text-3xl font-bold">문의함</h2>
                    <span className="text-sm text-gray-500">총 {rows.length}건</span>

                    <div className="ml-auto flex items-center gap-2">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as any)}
                            className="rounded-md border px-2 py-2 text-sm"
                        >
                            <option value="all">전체 상태</option>
                            <option value="new">신규</option>
                            <option value="in-progress">진행중</option>
                            <option value="done">완료</option>
                        </select>
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="검색(이름·연락처·내용)"
                            className="rounded-md border px-3 py-2 w-56 text-sm"
                        />
                    </div>
                </header>

                {/* 본문: 카드 리스트 */}
                {loading ? (
                    <section className="rounded-2xl border bg-white shadow-sm p-6 text-sm text-gray-500">
                        불러오는 중
                    </section>
                ) : filtered.length === 0 ? (
                    <section className="rounded-2xl border bg-white shadow-sm p-10 text-center text-gray-500">
                        문의가 없습니다.
                    </section>
                ) : (
                    <section className="space-y-4">
                        {filtered.map((row) => (
                            <article
                                key={row.id}
                                className="rounded-2xl border border-gray-200 bg-white shadow-sm px-4 py-4 md:px-5 md:py-5"
                            >
                                {/* 상단: 이름 / 상태 / 생성일 */}
                                <div className="flex flex-wrap items-start gap-3">
                                    <div>
                                        <div className="text-base font-semibold">{row.name}</div>
                                        {row.spaceType && (
                                            <div className="text-[12px] text-gray-500 mt-0.5">#{row.spaceType}</div>
                                        )}
                                    </div>

                                    <div className="ml-auto flex flex-wrap items-center gap-3">
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <select
                                                className="ml-1 rounded-md border px-2 py-1 text-xs"
                                                value={row.status ?? "new"}
                                                onChange={(e) => changeStatus(row.id, e.target.value as any)}
                                            >
                                                <option value="new">신규</option>
                                                <option value="in-progress">진행중</option>
                                                <option value="done">완료</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* 중간: 항목별 정보 (이름/전화/카카오/예산) */}
                                <dl className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-base">
                                    <div className="flex gap-2">
                                        <dt className="w-12 shrink-0 text-base text-gray-500">이름</dt>
                                        <dd className="text-gray-900">{row.name}</dd>
                                    </div>
                                    <div className="flex gap-2">
                                        <dt className="w-12 shrink-0 text-base text-gray-500">전화</dt>
                                        <dd className="text-gray-900">{row.phone || "-"}</dd>
                                    </div>
                                    <div className="flex gap-2">
                                        <dt className="w-12 shrink-0 text-base text-gray-500">카카오</dt>
                                        <dd className="text-gray-900">{row.kakaoId || "-"}</dd>
                                    </div>
                                    <div className="flex gap-2">
                                        <dt className="w-12 shrink-0 text-base text-gray-500">예산</dt>
                                        <dd className="text-gray-900">{row.budget || "-"}</dd>
                                    </div>
                                </dl>

                                {/* 내용 */}
                                <div className="mt-4">
                                    <div className="text-base text-gray-500 mb-1">내용</div>
                                    <p className="whitespace-pre-wrap text-sm text-gray-900">
                                        {row.message || "-"}
                                    </p>
                                </div>

                                {/* 하단 */}
                                <div className="flex justify-between mt-4">
                                    <div className="flex flex-wrap items-center gap-2 text-xs">
                                        <button
                                            onClick={() =>
                                                navigator.clipboard.writeText(
                                                    [
                                                        `이름: ${row.name}`,
                                                        `전화: ${row.phone ?? "-"}`,
                                                        `카카오: ${row.kakaoId ?? "-"}`,
                                                        `예산: ${row.budget ?? "-"}`,
                                                        `유형: ${row.spaceType ?? "-"}`,
                                                        `상태: ${row.status ?? "new"}`,
                                                        `생성일: ${formatDate(row.createdAt)}`,
                                                        "",
                                                        `내용:\n${row.message}`,
                                                    ].join("\n")
                                                )
                                            }
                                            className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50"
                                        >
                                            복사
                                        </button>
                                        <button
                                            onClick={() => remove(row.id)}
                                            className="px-3 py-1 rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                                        >
                                            삭제
                                        </button>
                                    </div>
                                    <div className="text-[12px] text-gray-500">
                                        {formatDate(row.createdAt)}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>
                )}
            </main>
        </>

    );
}
