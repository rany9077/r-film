"use client";

import React, { useEffect, useMemo, useState } from "react";

import Link from "next/link";
import Image from "next/image";
import { Post } from "@/types/post";
import { listenMyPosts } from "@/lib/posts";
import FadeInSection from "@/components/FadeInSection";
import {ChevronDown, ChevronRight, Plus } from "lucide-react";

import {
    PRODUCT_LINEUP,
    FILM_BENEFITS,
    PROCESS_STEPS,
    FAQ_ITEMS,
} from "@/constants/mainPage";
import {RollingNumber} from "@/components/RollingNumber";
import {getSupabaseClient} from "@/lib/supabaseClient";

const AUTHOR_UID = process.env.NEXT_PUBLIC_ADMIN_UID;


export default function Main() {
    const [mounted, setMounted] = useState(false);
    const [posts, setPosts] = useState<Post[]>([]);

    // 마운트 가드 (SSR/CSR hydration 차이 방지)
    useEffect(() => {
        setMounted(true);
    }, []);

    // 항상 AUTHOR_UID의 글을 구독 → 블로그/작업일지 공개
    useEffect(() => {
        if (!AUTHOR_UID) return;
        const unsub = listenMyPosts(AUTHOR_UID, (items) => {
            setPosts(items as Post[]);
        });
        return () => unsub && unsub();
    }, []);

    // 시공 사례 갤러리용 이미지 리스트
    const galleryImages = useMemo(() => {
        const urls =
            posts
                ?.flatMap((p) => p.imageUrls || [])
                .filter((url): url is string => !!url && url.trim().length > 0) ?? [];

        const unique = Array.from(new Set(urls)); // 중복 제거
        return unique.slice(0, 4); // 최대 4개만 노출
    }, [posts]);

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

    // 4초 뒤 메시지 자동 숨김
    useEffect(() => {
        if (done) {
            const timer = setTimeout(() => setDone(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [done]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (form.honey) return;
        if (!form.name.trim() || !form.phone.trim()) {
            alert("이름과 연락처를 입력해주세요.");
            return;
        }

        const supabase = getSupabaseClient();
        if (!supabase) {
            console.error("[ContactSection] Supabase client is not available");
            alert("문의 저장에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
            return;
        }

        try {
            setBusy(true);
            const {error} = await supabase.from("inquiries").insert({
                name: form.name.trim(),
                phone: form.phone.trim() || null,
                kakao_id: form.kakaoId.trim() || null, // 컬럼명을 kakao_id 로 가정
                message: form.message.trim(),
                budget: form.budget.trim() || null,
                space_type: form.spaceType,
                status: "new",
                // created_at 은 DB 디폴트 now() 로 두면 생략 가능
                created_at: new Date().toISOString(),
            });

            if (error) {
                console.error("[ContactSection] insert error", error);
                alert("문의 접수에 실패했습니다. 잠시 후 다시 시도해주세요.");
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
            alert("문의 접수에 실패했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setBusy(false);
        }

        // 초기 스켈레톤
        if (!mounted) {
            return (
                <div className="min-h-screen text-gray-900 overflow-hidden">
                    <main className="max-w-4xl mx-auto px-4 py-6">
                        <div className="h-40 rounded-xl border bg-white/60 animate-pulse"/>
                    </main>
                </div>
            );
        }
    }

    return (
        <div className="min-h-screen text-gray-900 overflow-hidden">
            <main>
                {/* 1) Hero 섹션 – 배경 이미지 위에 텍스트 오버레이 */}
                <FadeInSection>
                    <section
                        className="relative overflow-hidden min-h-[320px] sm:min-h-[420px] lg:min-h-[750px]"
                    >
                        {/* 배경 이미지 */}
                        <Image
                            src="/main_v2.jpg"
                            alt="인테리어 필름 시공된 거실 이미지"
                            fill
                            priority
                            className="object-cover"
                        />

                        <span className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/10" />

                        {/* 컨텐츠 래퍼 */}
                        <div className="relative z-10 h-full px-6 sm:px-10 lg:px-16 py-10 sm:py-14 lg:py-28 flex items-center">
                            <div className="max-w-xl">
                                <p className="text-xs font-medium tracking-[0.3em] uppercase text-[#701eff] mb-3">
                                    INTERIOR FILM STUDIO
                                </p>

                                <h2 className="text-3xl sm:text-[2.5rem] lg:text-[2.9rem] leading-tight font-bold text-gray-900">
                                    공간을 새롭게
                                    <br />
                                    <span className="text-[#7c49d4]">인테리어 필름</span>으로
                                </h2>

                                <p className="mt-4 text-sm sm:text-base text-gray-700 leading-relaxed">
                                    빠르고 깔끔한 시공으로 당신의 공간을 완전히 변화시켜드립니다.<br/>
                                    다양한 디자인과 뛰어난 내구성으로 새로운 인테리어를 경험해 보세요.
                                </p>

                                {/* CTA 버튼들 */}
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <Link
                                        href="#contact"
                                        className="inline-flex items-center justify-center rounded-full bg-[#7c49d4] px-6 py-2.5 text-sm sm:text-base font-medium text-white shadow-sm shadow-[#701eff94] hover:bg-[#701eff] transition-colors"
                                    >
                                        무료 상담 받기
                                    </Link>
                                    <Link
                                        href="/log"
                                        className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white/80 backdrop-blur px-6 py-2.5 text-sm sm:text-base font-medium text-gray-700 hover:bg-black hover:text-white transition-colors"
                                    >
                                        시공 갤러리 보기
                                    </Link>
                                </div>

                                {/* 하단 지표 */}
                                <div className="mt-7 sm:mt-8 grid grid-cols-3 gap-3 text-xs sm:text-sm">
                                    <div
                                        className="rounded-xl bg-white/90 border border-white/80 px-3 py-3 sm:px-4 sm:py-4 shadow-sm">
                                        <RollingNumber
                                            value={10}
                                            suffix="+"
                                            className="text-base sm:text-lg font-bold text-gray-900"
                                        />
                                        <div className="mt-1 text-gray-500">시공 완료</div>
                                    </div>
                                    <div
                                        className="rounded-xl bg-white/90 border border-white/80 px-3 py-3 sm:px-4 sm:py-4 shadow-sm">
                                        <RollingNumber
                                            value={98}
                                            suffix="%"
                                            className="text-base sm:text-lg font-bold text-[#701eff]"
                                        />
                                        <div className="mt-1 text-gray-500">고객 만족도</div>
                                    </div>
                                    <div
                                        className="rounded-xl bg-white/90 border border-white/80 px-3 py-3 sm:px-4 sm:py-4 shadow-sm">
                                        <RollingNumber
                                            value={1}
                                            suffix="년"
                                            className="text-base sm:text-lg font-bold text-gray-900"
                                        />
                                        <div className="mt-1 text-gray-500">시공 경력</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </FadeInSection>

                {/* 2) 다양한 제품 라인업 */}
                <FadeInSection>
                    <section className="py-20 lg:py-28">
                    <header className="text-center mb-6 sm:mb-8 px-4">
                            <h3 className="text-2xl font-semibold text-gray-900">
                                다양한 제품 라인업
                            </h3>
                            <p className="mt-2 text-sm text-gray-600">
                                원하는 스타일에 맞는 인테리어 필름을 선택해 보세요.
                            </p>
                        </header>

                        <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
                            {PRODUCT_LINEUP.map((item) => (
                                <article
                                    key={item.key}
                                    className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100"
                                >
                                    <div className="relative h-40 sm:h-44">
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            sizes="(max-width: 640px) 100vw,
                                             (max-width: 1024px) 50vw,
                                             33vw"
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-1 flex-col px-4 py-4">
                                        <h4>
                                            {item.title}
                                        </h4>
                                        <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-3">
                                            {item.description}
                                        </p>
                                        <div className="mt-auto">
                                            <div className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-[12px] font-medium text-[#701eff] mb-3">
                                                {item.tag}
                                            </div>
                                            {/*<button*/}
                                            {/*    type="button"*/}
                                            {/*    className="w-full text-sm sm:text-md rounded-full bg-[#7c49d4] text-white py-2 font-medium hover:bg-[#701eff] transition-colors"*/}
                                            {/*>*/}
                                            {/*    {item.cta}*/}
                                            {/*</button>*/}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                </FadeInSection>

                {/* 3) 왜 인테리어 필름인가요? */}
                <FadeInSection>
                    <section className="bg-gray-50 py-20 lg:py-28">
                        <header className="text-center mb-6 sm:mb-8 px-4">
                            <h3>
                                왜 인테리어 필름인가요?
                            </h3>
                            <p>
                                기존 인테리어와 비교했을 때 인테리어 필름만의 장점을 정리해
                                보았습니다.
                            </p>
                        </header>

                        <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
                            {FILM_BENEFITS.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div
                                        key={item.title}
                                        className="flex flex-col rounded-xl bg-white border border-gray-100 px-4 py-4 shadow-sm"
                                    >
                                        <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-purple-50 text-[#701eff]">
                                            <Icon className="w-5 h-5" strokeWidth={2.1} />
                                        </div>
                                        <h4>
                                            {item.title}
                                        </h4>
                                        <p className="mt-2 text-[12px] sm:text-sm text-gray-600 leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </FadeInSection>

                {/* 4) 시공 사례 (이미지 갤러리) */}
                <FadeInSection>
                    <section className="py-20 lg:py-28" id="products">
                        <header className="text-center mb-6 sm:mb-8 px-4">
                            <h3>시공 사례</h3>
                            <p>
                                다양한 공간에서 완성된 아름다운 변화를 확인해보세요.
                            </p>
                        </header>

                        {galleryImages.length === 0 ? (
                            <div
                                className="rounded-xl bg-white border border-dashed border-gray-300 py-10 text-center text-sm text-gray-500">
                                아직 등록된 작업 이미지가 없습니다.
                                <br/>
                                작업 일지가 쌓이면 실제 시공 사진들이 자동으로 노출됩니다.
                            </div>
                        ) : (
                            <div className="grid gap-3 sm:gap-4 grid-cols-2">
                                {galleryImages.map((src, idx) => (
                                    <figure
                                        key={src + idx}
                                        className="relative overflow-hidden rounded-xl bg-gray-100 shadow-sm"
                                    >
                                        <div className="relative h-40 sm:h-60 md:h-80">
                                            <Image
                                                src={src}
                                                alt={`시공 사례 이미지 ${idx + 1}`}
                                                fill
                                                sizes="(max-width: 640px) 100vw,
                                                 (max-width: 1024px) 50vw,
                                                 33vw"
                                                className="object-cover transition-transform duration-500 hover:scale-[1.03]"
                                            />
                                        </div>
                                    </figure>
                                ))}
                            </div>
                        )}
                        <div className="mt-8 flex justify-center">
                            <Link
                                href="/log"
                                className="
                                  inline-flex items-center gap-1.5
                                  px-5 py-2.5
                                  text-sm font-medium
                                  rounded-full
                                  border border-gray-300
                                  text-gray-700
                                  bg-white
                                  hover:bg-gray-50 hover:border-gray-400
                                  transition-all duration-200
                                "
                            >
                                더 보기
                                <ChevronRight size={16} strokeWidth={2} />
                            </Link>
                        </div>
                    </section>
                </FadeInSection>

                {/* 5) 시공 프로세스 */}
                <FadeInSection>
                    <section className="bg-gray-50 py-20 lg:py-28">
                        <header className="text-center mb-6 sm:mb-8 px-4">
                            <h3>
                                시공 프로세스
                            </h3>
                            <p>
                                처음 문의부터 시공, A/S까지의 전체 흐름을 한눈에 볼 수 있습니다.
                            </p>
                        </header>

                        <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
                            {PROCESS_STEPS.map((step) => (
                                <article
                                    key={step.step}
                                    className="rounded-xl bg-white border border-gray-100 px-4 py-4 shadow-sm"
                                >
                                    <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-[#701eff] text-xs font-semibold">
                                        {step.step}
                                    </div>
                                    <h4>
                                        {step.title}
                                    </h4>
                                    <p className="mt-2 text-[12px] sm:text-sm text-gray-600 leading-relaxed">
                                        {step.description}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </section>
                </FadeInSection>

                {/* 6) 자주 묻는 질문 */}
                <FadeInSection>
                    <section className="py-20 lg:py-28">
                        <div>
                            <header className="text-center mb-4 sm:mb-6">
                                <h3>
                                    자주 묻는 질문
                                </h3>
                                <p>
                                    고객님들이 많이 궁금해하시는 내용을 먼저 모아두었습니다.
                                </p>
                            </header>

                            <div
                                className="mx-auto rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                                <div className="border-t border-b border-gray-200 divide-y divide-gray-200">
                                    {FAQ_ITEMS.map((item) => (
                                        <details key={item.q} className="group cursor-pointer">
                                            <summary
                                                className="flex items-center justify-between list-none px-4 sm:px-6">
                                            <span
                                                className="font-medium text-gray-900 py-3 sm:py-4 text-sm sm:text-base">
                                                {item.q}
                                            </span>
                                                <span className="transition-transform">
                                                <Plus
                                                    className="
                                                        w-4 h-4
                                                        transition-transform duration-200
                                                        group-open:rotate-45
                                                    "
                                                />
                                            </span>
                                            </summary>
                                            <p className="px-4 sm:px-6 pb-4 text-sm text-gray-600 leading-relaxed">
                                                {item.a}
                                            </p>
                                        </details>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </FadeInSection>

                {/* 7) 상담 폼 섹션 */}
                <FadeInSection>
                    <section
                        id="contact"
                        className="relative overflow-hidden bg-gradient-to-r from-[#7c49d4] to-[#701eff] text-white py-20 lg:py-28"
                    >
                        <div className="flex center flex-col md:flex-row md:justify-between gap-8">
                            {/* 왼쪽 안내 텍스트 */}
                            <div>
                                <p className="text-sm font-medium tracking-[0.25em] uppercase text-purple-50/80">
                                    CONTACT
                                </p>
                                <h3 className="mt-3 text-2xl sm:text-3xl font-bold leading-tight text-white!">
                                    지금 바로
                                    <br/>
                                    무료 상담을 받아보세요.
                                </h3>
                                <p className="mt-3 text-sm sm:text-base text-purple-50/90!">
                                    공간 사진과 함께 문의를 남겨주시면, <br/>일정과 예산에 맞는
                                    현실적인 견적 범위를 안내드립니다.
                                </p>

                                <ul className="mt-5 space-y-1.5 text-base text-purple-50/90">
                                    <li>· 카카오톡 1:1 상담 가능</li>
                                    <li>· 주거/상업 공간 모두 시공 가능</li>
                                    <li>· 서울 및 수도권 위주로 운영 중</li>
                                </ul>

                                <div className="mt-6 text-sm sm:text-base text-purple-50/80 space-y-1.5">
                                    <p>카카오톡 채널 또는 무료 상담 신청으로 편하게 남겨 주세요.</p>
                                </div>
                            </div>
                            <form
                                className="rounded-xl bg-white text-gray-900 px-5 py-6 sm:px-6 sm:py-7 shadow-xl"
                                onSubmit={onSubmit}
                            >
                                <h3>
                                    상담 신청하기
                                </h3>

                                {done && (
                                    <div
                                        className="mb-4 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm sm:text-base text-purple-800">
                                        ✔️ 문의가 접수되었습니다! 확인 후 연락드릴게요.
                                    </div>
                                )}

                                {/* 봇 방지 필드 */}
                                <input
                                    tabIndex={-1}
                                    autoComplete="off"
                                    value={form.honey}
                                    onChange={(e) =>
                                        setForm({...form, honey: e.target.value})
                                    }
                                    className="hidden"
                                />

                                <div className="space-y-4 text-sm sm:text-base mt-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block mb-1 font-medium text-gray-800 text-sm">
                                            이름 *
                                            </label>
                                            <input
                                                className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none text-sm focus:ring-1 focus:ring-[#701eff]/70 focus:border-[#701eff]"
                                                value={form.name}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        name: e.target.value,
                                                    })
                                                }
                                                placeholder="이름을 입력해주세요."
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block mb-1 font-medium text-gray-800 text-sm">
                                                연락처 *
                                            </label>
                                            <input
                                                className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none text-sm focus:ring-1 focus:ring-[#701eff]/70 focus:border-[#701eff]"
                                                value={form.phone}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        phone: e.target.value,
                                                    })
                                                }
                                                placeholder="010-1234-5678"
                                                inputMode="tel"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block mb-1 font-medium text-gray-800 text-sm">
                                                카카오톡 아이디
                                            </label>
                                            <input
                                                className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none text-sm focus:ring-1 focus:ring-[#701eff]/70 focus:border-[#701eff]"
                                                value={form.kakaoId}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        kakaoId: e.target.value,
                                                    })
                                                }
                                                placeholder="카카오ID를 입력해주세요."
                                            />
                                        </div>
                                        <div>
                                            <label className="block mb-1 font-medium text-gray-800 text-sm">
                                                예산 (선택)
                                            </label>
                                            <input
                                                className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none text-sm focus:ring-1 focus:ring-[#701eff]/70 focus:border-[#701eff]"
                                                value={form.budget}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        budget: e.target.value,
                                                    })
                                                }
                                                placeholder="예: 50~80만원"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block mb-1 font-medium text-gray-800 text-sm">
                                            공간 유형
                                        </label>
                                        <div className="relative">
                                            <select
                                                className="w-full rounded-lg border border-gray-200 px-3 py-2 pr-10
                                              outline-none text-sm
                                              appearance-none
                                              focus:ring-1 focus:ring-[#701eff]/70 focus:border-[#701eff]"
                                                value={form.spaceType}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        spaceType: e.target.value,
                                                    })
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

                                    <div>
                                        <label className="block mb-1 font-medium text-gray-800 text-sm">
                                            문의 내용
                                        </label>
                                        <textarea
                                            rows={3}
                                            className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none text-sm resize-none focus:ring-1 focus:ring-[#701eff]/70 focus:border-[#701eff]"
                                            value={form.message}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    message: e.target.value,
                                                })
                                            }
                                            placeholder="간단한 공간 설명과 궁금하신 점을 남겨주세요."
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={busy}
                                        className="mt-2 w-full rounded-full text-white bg-[#7c49d4] px-6 py-2.5 text-sm sm:text-base font-semibold shadow-sm shadow-[#701eff94] hover:bg-[#701eff] transition-colors disabled:opacity-50"
                                    >
                                        {busy ? "전송 중…" : "무료 상담 신청"}
                                    </button>

                                    <p className="text-sm text-gray-500 pt-1 tracking-tighter">
                                        * 입력하신 정보는 문의 응대 목적에만 사용되며, 처리 후 안전하게 보관됩니다.
                                    </p>
                                </div>
                            </form>
                        </div>
                    </section>
                </FadeInSection>
            </main>
        </div>
    );
}