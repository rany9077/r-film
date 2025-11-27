import type { Post } from "@/types/post";
import ImagePreview from "@/components/ImagePreview";

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
    return (
        <article className="rounded-2xl border border-gray-200 p-5 bg-white shadow-sm overflow-hidden">
            <header className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">{post.title}</h2>

                {/* 작성자일 때만 수정/삭제 버튼 출력 */}
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

            <p className="text-xs text-gray-400 mt-1">{new Date(post.createdAt).toLocaleDateString("ko-KR")}</p>

            {post.imageUrls && post.imageUrls.length > 0 && (
                <div className="mt-4">
                    <ImagePreview images={post.imageUrls} alt={post.title} />
                </div>
            )}

            <p className="mt-4 whitespace-pre-wrap leading-7 text-gray-800 text-sm">
                {post.content}
            </p>
        </article>
    );
}
