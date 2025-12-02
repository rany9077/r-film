import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllMdxPosts, getMdxPostBySlug } from "@/lib/mdxPosts";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

// 완전 정적
export const dynamic = "force-static";

type PageProps = {
    params: Promise<{
        slug: string;
    }>;
};

// SSG용: 어떤 slug들을 미리 빌드할지
export async function generateStaticParams() {
    const posts = await getAllMdxPosts();

    return posts.map((post) => ({
        slug: post.id,
    }));
}

// 동적 메타데이터 (SEO)
export async function generateMetadata(
    { params }: PageProps
): Promise<Metadata> {
    const { slug } = await params;

    const post = await getMdxPostBySlug(slug);

    // 글이 없으면 인덱싱 안 되게 처리
    if (!post) {
        return {
            title: "작업 일지를 찾을 수 없습니다",
            description: "요청하신 작업 일지를 찾을 수 없습니다.",
            robots: {
                index: false,
                follow: false,
            },
        };
    }

    const { frontmatter } = post;

    const title = frontmatter.title ?? "작업 일지";
    const description =
        frontmatter.summary ??
        "R.FILM 인테리어 필름 시공 작업 일지입니다.";
    const date = frontmatter.date ?? undefined;
    const coverImage = frontmatter.coverImage ?? undefined;

    const canonicalPath = `/log/${slug}`;

    return {
        title,
        description,
        alternates: {
            canonical: canonicalPath,
        },
        openGraph: {
            type: "article",
            url: canonicalPath,
            title,
            description,
            images: coverImage ? [{ url: coverImage }] : undefined,
        },
        other: date
            ? {
                "article:published_time": date,
            }
            : undefined,
    };
}

export default async function LogDetailPage({ params }: PageProps) {
    const { slug } = await params;

    const post = await getMdxPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const { frontmatter, content } = post;

    // 전체 MDX 포스트 불러와서 이전글/다음글 계산
    const allPosts = await getAllMdxPosts();

    // createdAt 기준으로 최신순 정렬
    const sorted = [...allPosts].sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return bTime - aTime; // 최신 → 과거
    });

    // 현재 글의 위치 찾기 (id 기준)
    const currentIndex = sorted.findIndex((p) => p.id === slug);

    const prevPost =
        currentIndex > 0 ? sorted[currentIndex - 1] : null; // 리스트 상에서 "이전(위쪽)"
    const nextPost =
        currentIndex >= 0 && currentIndex < sorted.length - 1
            ? sorted[currentIndex + 1]
            : null; // 리스트 상에서 "다음(아래쪽)"

    return (
        <main className="max-w-5xl mx-auto px-6 pt-7 pb-20">
            <header className="mb-8">
                <Link
                    href="/log"
                    className="inline-block text-sm text-gray-700 hover:text-gray-700
                   transition-colors duration-200 mb-5"
                >
                    ← 목록으로
                </Link>

                <p className="text-xs text-gray-400">
                    작업 일지 ·{" "}
                    {frontmatter.date
                        ? new Date(frontmatter.date).toLocaleDateString("ko-KR")
                        : ""}
                </p>
                <h2 className="mt-2 text-2xl md:text-3xl font-bold text-gray-900">
                    {frontmatter.title}
                </h2>
                {frontmatter.summary && (
                    <p className="mt-3 text-sm text-gray-600">
                        {frontmatter.summary}
                    </p>
                )}

                {/* 커버 이미지 다시 쓰고 싶으면 이 부분만 주석 해제 */}
                {/* {frontmatter.coverImage && (
                    <div className="relative w-full h-64 md:h-80 mt-6 rounded-xl overflow-hidden">
                        <Image
                            src={frontmatter.coverImage}
                            alt="cover"
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 768px"
                            priority
                        />
                    </div>
                )} */}
            </header>

            <article className="prose prose-gray max-w-none prose-img:rounded-xl prose-img:shadow-sm">
                {content}
            </article>

            <nav className="mt-12 pt-6 flex items-center justify-between text-sm text-gray-500">

                {/* 이전글 */}
                {prevPost ? (
                    <Link
                        href={`/log/${prevPost.id}`}
                        className="
                        inline-flex items-center gap-1
                        transition-all duration-250 delay-100
                        hover:translate-x-[-3px] hover:font-semibold
                    "
                    >
                        <ChevronLeft size={18} className="text-gray-5500"/>
                        <span className="font-medium">{prevPost.title}</span>
                    </Link>
                ) : (
                    <span/>
                )}

                {/* 다음글 */}
                {nextPost ? (
                    <Link
                        href={`/log/${nextPost.id}`}
                        className="
                        inline-flex items-center gap-1 text-right
                        transition-all duration-250 delay-100
                        hover:translate-x-[3px] hover:font-semibold
                    "
                    >
                        <span className="font-medium">{nextPost.title}</span>
                        <ChevronRight size={18} className="text-gray-500"/>
                    </Link>
                ) : (
                    <span/>
                )}

            </nav>
        </main>
    );
}
