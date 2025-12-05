"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export default function ContactSection() {
    const [form, setForm] = useState({
        name: "",
        phone: "",
        kakaoId: "",
        message: "",
        budget: "",
        spaceType: "door",
        honey: "",
    });
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(false);

    // 4초 뒤 완료 메시지 자동 숨김
    useEffect(() => {
        if (done) {
            const timer = setTimeout(() => setDone(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [done]);

    /** 유효성 검사 함수 */
    const validateForm = () => {
        if (!form.name.trim()) {
            toast.error("이름을 입력해주세요.");
            return false;
        }
        if (!form.phone.trim()) {
            toast.error("연락처를 입력해주세요.");
            return false;
        }
        return true;
    };

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (form.honey) return;

        if (!validateForm()) return;

        const supabase = getSupabaseClient();
        if (!supabase) {
            console.error("[ContactSection] Supabase client unavailable");
            toast.error("문의 저장에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
            return;
        }

        try {
            setBusy(true);

            const { error } = await supabase.from("inquiries").insert({
                name: form.name.trim(),
                phone: form.phone.trim(),
                kakao_id: form.kakaoId.trim() || null,
                message: form.message.trim(),
                budget: form.budget.trim() || null,
                space_type: form.spaceType,
                status: "new",
                created_at: new Date().toISOString(),
            });

            if (error) {
                console.error("[ContactSection] insert error", error);
                toast.error("문의 접수에 실패했습니다. 다시 시도해주세요.");
                return;
            }

            setDone(true);
            setForm({
                name: "",
                phone: "",
                kakaoId: "",
                message: "",
                budget: "",
                spaceType: "door",
                honey: "",
            });
        } catch (err) {
            console.error(err);
            toast.error("문의 접수 중 오류가 발생했습니다.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <section className="mx-auto mt-8">

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                    <h2 className="text-lg md:text-xl font-semibold">📩문의하기</h2>
                </div>

                <div className="px-5 py-5 md:p-6">
                    <p className="text-sm md:text-[15px] text-gray-600">
                        공간 및 가구 등 인테리어 필름 작업이 필요하신 내용을 편하게 남겨주세요.
                        <br />
                        일정과 작업 가능 여부를 확인한 뒤 연락드릴게요.
                    </p>

                    {done && (
                        <div className="mt-4 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-700 animate-fadeIn">
                            ✔️문의가 접수되었습니다! 확인 후 연락드릴게요.
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="mt-5 space-y-4">
                        {/* 봇 방지 필드 */}
                        <input
                            tabIndex={-1}
                            autoComplete="off"
                            value={form.honey}
                            onChange={(e) =>
                                setForm({ ...form, honey: e.target.value })
                            }
                            className="hidden"
                        />

                        {/* 이름/연락처 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">
                                    이름 *
                                </label>
                                <input
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-1 focus:ring-[#701eff]/70 focus:border-[#701eff]"
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({ ...form, name: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">
                                    연락처 *
                                </label>
                                <input
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-1 focus:ring-[#701eff]/70 focus:border-[#701eff]"
                                    value={form.phone}
                                    onChange={(e) =>
                                        setForm({ ...form, phone: e.target.value })
                                    }
                                    placeholder="010-1234-5678"
                                    inputMode="tel"
                                />
                            </div>
                        </div>

                        {/* 카카오/예산 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">
                                    카카오톡 아이디
                                </label>
                                <input
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-1 focus:ring-[#701eff]/70 focus:border-[#701eff]"
                                    value={form.kakaoId}
                                    onChange={(e) =>
                                        setForm({ ...form, kakaoId: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">
                                    예산(선택)
                                </label>
                                <input
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-1 focus:ring-[#701eff]/70 focus:border-[#701eff]"
                                    value={form.budget}
                                    onChange={(e) =>
                                        setForm({ ...form, budget: e.target.value })
                                    }
                                    placeholder="예: 50~80만원"
                                />
                            </div>
                        </div>

                        {/* 공간 유형 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">
                                    공간 유형
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 pr-10 outline-none text-sm appearance-none focus:ring-1 focus:ring-[#701eff]/70 focus:border-[#701eff]"
                                        value={form.spaceType}
                                        onChange={(e) =>
                                            setForm({ ...form, spaceType: e.target.value })
                                        }
                                    >
                                        <option value="door">문/문틀</option>
                                        <option value="kitchen">싱크대</option>
                                        <option value="furniture">가구</option>
                                        <option value="wall">벽면</option>
                                        <option value="etc">기타</option>
                                    </select>
                                    <ChevronDown
                                        size={18}
                                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 문의 내용 */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">
                                문의 내용
                            </label>
                            <textarea
                                className="w-full min-h-48 rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-1 focus:ring-[#701eff]/70 focus:border-[#701eff]"
                                value={form.message}
                                onChange={(e) =>
                                    setForm({ ...form, message: e.target.value })
                                }
                            />
                        </div>

                        {/* 버튼 */}
                        <div className="flex items-center gap-2 pt-1">
                            <button
                                disabled={busy}
                                className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-white hover:opacity-90 disabled:opacity-40"
                            >
                                {busy ? "전송 중…" : "문의 보내기"}
                            </button>
                        </div>

                        <p className="text-[11px] text-gray-400 pt-1">
                            *입력하신 정보는 문의 응대 목적에만 사용되며, 처리 후 안전하게 보관됩니다.
                        </p>
                    </form>
                </div>
            </div>
        </section>
    );
}
