"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import PostCard from "@/components/PostCard";
import NoResults from "@/components/NoResults";
import { Post } from "@/types/post";
import { useAuth } from "@/contexts/AuthContext";
import { listenMyPosts, deletePost, updatePost, createPost } from "@/lib/posts";
import WriteButton from "@/components/WriteButton";
import WritePopup from "@/components/WritePopup";
import ContactButton from "@/components/ContactButton";
import { MdxPostMeta } from "@/lib/mdxPosts";
import Link from "next/link";
import Header from "@/components/Header";

const AUTHOR_UID = process.env.NEXT_PUBLIC_AUTHOR_UID;

type Props = {
    initialMdxPosts: MdxPostMeta[];
    query: string;
};

type UnifiedPost = (Post & { source: "firebase" }) | MdxPostMeta;

export default function WorkLogClient({ initialMdxPosts }: Props) {
    const [mounted, setMounted] = useState(false);
    const [firebasePosts, setFirebasePosts] = useState<Post[]>([]);
    const [mdxPosts] = useState<MdxPostMeta[]>(initialMdxPosts);
    const [query, setQuery] = useState("");
    const [editing, setEditing] = useState<Post | null>(null);
    const [open, setOpen] = useState(false);

    const { user } = useAuth();
    const isAuthor = !!user && !!AUTHOR_UID && user.uid === AUTHOR_UID;

    useEffect(() => setMounted(true), []);

    // Firebase 실시간 구독
    useEffect(() => {
        if (!AUTHOR_UID) return;
        const unsub = listenMyPosts(AUTHOR_UID, (items) =>
            setFirebasePosts(items as Post[])
        );
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

    // Firebase + MDX 합치고 검색/정렬
    const merged: UnifiedPost[] = useMemo(() => {
        const firebaseWithSource: UnifiedPost[] = firebasePosts.map((p) => ({
            ...p,
            source: "firebase",
        }));

        const all: UnifiedPost[] = [...mdxPosts, ...firebaseWithSource];

        const q = query.trim().toLowerCase();

        const filtered = q
            ? all.filter((p) => {
                const title = ("title" in p && p.title) || "";
                const content =
                    "content" in p && true
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

        // 최신순 정렬 (내림차순)
        filtered.reverse();

        return filtered;
    }, [firebasePosts, mdxPosts, query]);

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
            <main className="max-w-5xl mx-auto px-4 py-8 space-y-4">
                <header className="mb-4">
                    <h2 className="text-2xl md:text-3xl font-bold mb-1">작업 일지</h2>
                    <p className="text-sm text-gray-600">
                        인테리어 필름 실습 기록부터 실제 현장 작업까지, 순차적으로
                        정리하고 있습니다.
                    </p>
                </header>

                {merged.length === 0 ? (
                    <NoResults />
                ) : (
                    <div className="grid gap-4">
                        {merged.map((post) =>
                            post.source === "firebase" ? (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    isAuthor={isAuthor}
                                    onEditAction={(p) => {
                                        if (!isAuthor) return;
                                        setEditing(p);
                                        setOpen(true);
                                    }}
                                    onDeleteAction={async (id) => {
                                        if (!isAuthor || !AUTHOR_UID) return;
                                        if (!confirm("정말 삭제하시겠습니까?")) return;
                                        await deletePost(AUTHOR_UID, id);
                                    }}
                                />
                            ) : (
                                // MDX 포스트 카드 – 필요하다면 전용 카드 컴포넌트 만들어도 됨
                                <Link
                                    key={post.id}
                                    href={`/log/${post.id}`}
                                    className="rounded-2xl border border-gray-200 p-5 bg-white shadow-sm overflow-hidden"
                                >
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 pb-2">
                                            {post.title}
                                        </h2>
                                        <div className="text-xs text-gray-400">
                                        {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                                        </div>
                                        {post.summary && (
                                            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                                {post.summary}
                                            </p>
                                        )}

                                        {/* 썸네일 영역 */}
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
                                                <div
                                                    className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                                                    <span className="text-white/70 text-sm">자세히 보기</span>
                                                </div>
                                            </div>

                                        )}
                                    </div>
                                </Link>
                            )
                        )}
                    </div>
                )}
            </main>

            <WriteButton onClick={() => setOpen(true)} />
            <ContactButton />

            {open && (
                <WritePopup
                    initial={editing ?? undefined}
                    onSaveAction={async (data) => {
                        if (editing) {
                            await handleUpdateAction(editing, data);
                        } else {
                            await handleCreateAction(data);
                        }
                        setEditing(null);
                        setOpen(false);
                    }}
                    onCloseAction={() => {
                        setEditing(null);
                        setOpen(false);
                    }}
                />
            )}
        </div>
    );
}
