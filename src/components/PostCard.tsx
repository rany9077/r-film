import type { Post } from "@/types/post";
import Zoom from "react-medium-image-zoom";
import Image from "next/image";
import React from "react";
import {ZoomIn} from "lucide-react";

export default function PostCard({
                                     post,
                                     onEditAction,
                                     onDeleteAction,
                                     isAuthor,
                                 }: {
    post: Post;
    onEditAction: (p: Post) => void;
    onDeleteAction: (id: string) => void;
    isAuthor: boolean;
}) {
    const hasImages = Array.isArray(post.imageUrls) && post.imageUrls.length > 0;
    const mainImage = hasImages ? post.imageUrls![0] : null;

    return (
        <article className="rounded-2xl border border-gray-200 p-5 bg-white shadow-sm overflow-hidden">
            {/* 헤더 */}
            <header className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    {post.title}
                </h2>

                {isAuthor && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => onEditAction(post)}
                            className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
                        >
                            수정
                        </button>
                        <button
                            onClick={() => onDeleteAction(post.id)}
                            className="px-3 py-1.5 text-sm border rounded-lg border-red-300 text-red-600 hover:bg-red-50"
                        >
                            삭제
                        </button>
                    </div>
                )}
            </header>

            {/* 날짜 */}
            <p className="text-xs text-gray-400 mt-1">
                {new Date(post.createdAt).toLocaleDateString("ko-KR")}
            </p>

            {/* 이미지 + Zoom */}
            {hasImages && mainImage && (
                <div className="mt-4">
                    <Zoom>
                        <div className="relative">
                            <Image
                                src={mainImage}
                                alt={post.title}
                                width={1200}
                                height={900}
                                className="object-cover rounded-xl cursor-zoom-in"
                            />
                            <div className="absolute top-3 right-4 bg-black/5 p-1.5 rounded-md">
                                <ZoomIn size={20} strokeWidth={2} className="text-[#333]"/>
                            </div>
                        </div>
                    </Zoom>


                </div>
            )}

            {/* 내용 */}
            <p className="mt-4 whitespace-pre-wrap leading-7 text-gray-800 text-sm">
                {post.content}
            </p>
        </article>
    );
}
