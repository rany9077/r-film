"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Post } from "@/types/post";
import type { Post as SupabasePost } from "@/types/post";
import { MdxPost } from "@/types/post";
import { useAuth } from "@/contexts/AuthContext";
import { listenMyPosts, deletePost, updatePost, createPost } from "@/lib/posts";
import NoResults from "@/components/NoResults";
import WriteButton from "@/components/WriteButton";
import WritePopup from "@/components/WritePopup";
import ContactButton from "@/components/ContactButton";
import Header from "@/components/Header";
import PostCarousel from "@/components/PostCarousel";
import { SquarePen } from "lucide-react";
import FadeInSection from "./FadeInSection";

const AUTHOR_UID = process.env.NEXT_PUBLIC_ADMIN_UID;

type Props = {
    initialMdxPosts: MdxPost[];
    query: string;
};

export type UnifiedPost = SupabasePost | MdxPost;

export default function WorkLogClient({ initialMdxPosts }: Props) {
    const [mounted, setMounted] = useState(false);
    const [supabasePosts, setSupabasePosts] = useState<Post[]>([]);
    const [mdxPosts] = useState<MdxPost[]>(initialMdxPosts);
    const [query, setQuery] = useState("");
    const [editing, setEditing] = useState<Post | null>(null);
    const [oSquarePen, setOSquarePen] = useState(false);
    const [isCarouselReady, setIsCarouselReady] = useState(false);

    const { user } = useAuth();
    const isAuthor = !!user && !!AUTHOR_UID && user.id === AUTHOR_UID;

    useEffect(() => setMounted(true), []);

    // 실시간 구독
    useEffect(() => {
        if (!AUTHOR_UID) return;
        const unsub = listenMyPosts(AUTHOR_UID, (items) => {
            setSupabasePosts(items as Post[]);
            setIsCarouselReady(true);   // 첫 응답 들어온 시점
        });
        return () => unsub && unsub();
    }, []);

    // 글 생성/수정
    const handleCreateAction = async (data: {
        title: string;
        content: string;
        imageUrls: string[];
    }) => {
        if (!isAuthor || !AUTHOR_UID) {
            alert("글 작성 권한이 없습니다.");
            return;
        }
        await createPost(AUTHOR_UID, data);
    };

    const handleUpdateAction = async (
        target: Post,
        data: { title: string; content: string; imageUrls: string[] }
    ) => {
        if (!isAuthor || !AUTHOR_UID) {
            alert("글 수정 권한이 없습니다.");
            return;
        }
        await updatePost(AUTHOR_UID, (target as any).id, data);
    };

    const handleDeletePost = async (id: string) => {
        if (!isAuthor || !AUTHOR_UID) return;
        if (!confirm("정말 삭제하시겠습니까?")) return;

        // 1) 낙관적 업데이트: 화면에서 먼저 제거
        setSupabasePosts((prev) => prev.filter((post) => post.id !== id));

        // 2) 실제 Supabase 삭제
        await deletePost(AUTHOR_UID, id);
    };

    // supabase + MDX 합치고 검색/정렬 + 타입별 분리
    const { supabaseFiltered, mdxFiltered } = useMemo(() => {
        const all: UnifiedPost[] = [...mdxPosts, ...supabasePosts];

        const q = query.trim().toLowerCase();

        const filtered = q
            ? all.filter((p) => {
                const title = ("title" in p && p.title) || "";
                const content =
                    "content" in p
                        ? p.content
                        : "summary" in p
                            ? p.summary || ""
                            : "";

                return (
                    title.toLowerCase().includes(q) ||
                    content.toLowerCase().includes(q)
                );
            })
            : all;

        filtered.sort(
            (a, b) =>
                +new Date(
                    "createdAt" in a ? a.createdAt : (a as any).createdAt || 0
                ) -
                +new Date(
                    "createdAt" in b ? b.createdAt : (b as any).createdAt || 0
                )
        );

        filtered.reverse(); // 최신순

        const supabaseFiltered = filtered.filter(
            (p): p is SupabasePost => "content" in p
        );
        const mdxFiltered = filtered.filter(
            (p): p is MdxPost => !("content" in p)
        );

        return { supabaseFiltered, mdxFiltered };
    }, [supabasePosts, mdxPosts, query]);

    if (!mounted) {
        return (
            <div className="min-h-screen bg-gray-50 text-gray-900 overflow-hidden">
                <main className="max-w-4xl mx-auto px-4 py-6">
                    <div className="h-40 rounded-2xl border bg-white/60 animate-pulse" />
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 overflow-hidden">
            <Header
                query={query}
                onQueryChangeAction={setQuery}
            />
            <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">

                {/* 1) Supabase 글 캐러셀 */}
                {supabaseFiltered.length > 0 && (
                    <FadeInSection>
                        <section aria-label="현장 일지 슬라이드">
                            <h2 className="text-[18px] font-medium mx-2 mb-3 flex items-center gap-1">
                                <SquarePen size={20} strokeWidth={2} className="text-[#111]"/>
                                현장 일지
                            </h2>

                            {!isCarouselReady  ? (
                                // 캐러셀 로딩 자리 확보
                                <div className="h-[260px] w-full rounded-2xl border bg-white/60 animate-pulse"/>
                            ) : supabaseFiltered.length > 0 ? (
                                <FadeInSection>
                                    <PostCarousel
                                        posts={supabaseFiltered}
                                        isAuthor={isAuthor}
                                        onEditAction={(p) => {
                                            if (!isAuthor) return;
                                            setEditing(p);
                                            setOSquarePen(true);
                                        }}
                                        onDeleteAction={handleDeletePost}
                                    />
                                </FadeInSection>
                            ) : null}
                        </section>
                    </FadeInSection>
                )}

                {/* 2) MDX 글 리스트 */}
                {isCarouselReady && (
                <section aria-label="수업 작업 일지" className="mb-9 md:mb-15">
                    <h2 className="text-[18px] font-medium mx-2 mb-3 flex items-center gap-1">
                        <SquarePen size={20} strokeWidth={2} className="text-[#111]"/>
                        수업 일지
                    </h2>

                    {mdxFiltered.length === 0 && supabaseFiltered.length === 0 ? (
                        <NoResults/>
                    ) : mdxFiltered.length === 0 ? (
                        <div className="rounded-xl border bg-white shadow-sm p-6 text-sm text-gray-500">
                            작업 일지가 없습니다.
                        </div>
                    ) : (
                        <div className="grid gap-4 p-0!">
                            {mdxFiltered.map((post) => (

                                <Link
                                    key={post.id}
                                    href={`/log/${post.id}`}
                                    className="rounded-xl border border-gray-200 p-5 bg-white shadow-sm overflow-hidden"
                                >
                                    <FadeInSection>
                                    <div>
                                        <h3 className="text-base! font-medium text-gray-900 pb-2">
                                            {post.title}
                                        </h3>
                                        <div className="text-xs text-gray-400">
                                            {new Date(post.createdAt).toLocaleDateString(
                                                "ko-KR"
                                            )}
                                        </div>
                                        {post.summary && (
                                            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                                {post.summary}
                                            </p>
                                        )}

                                        {post.coverImage && (
                                            <div className="relative w-full h-50 sm:h-58 md:h-62 mt-4">
                                                <Image
                                                    src={post.coverImage}
                                                    alt={post.title}
                                                    fill
                                                    sizes="(max-width: 640px) 100vw,
                                                       (max-width: 1024px) 50vw,
                                                       33vw"
                                                    className="object-cover rounded-lg"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                                                <span className="text-white/70 text-sm">
                                                    자세히 보기
                                                </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    </FadeInSection>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
                )}
            </main>

            <WriteButton onClick={() => setOSquarePen(true)} />
            <ContactButton />

            {oSquarePen && (
                <WritePopup
                    initial={editing ?? undefined}
                    onSaveAction={async (data) => {
                        if (editing) {
                            await handleUpdateAction(editing, data);
                        } else {
                            await handleCreateAction(data);
                        }
                        setEditing(null);
                        setOSquarePen(false);
                    }}
                    onCloseAction={() => {
                        setEditing(null);
                        setOSquarePen(false);
                    }}
                />
            )}
        </div>
    );
}
