import { notFound } from "next/navigation";
import { getAllMdxPosts, getMdxPostBySlug } from "@/lib/mdxPosts";
import Image from "next/image";

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

export default async function LogDetailPage({ params }: PageProps) {
    const { slug } = await params;

    const post = await getMdxPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const { frontmatter, content } = post;

    return (
        <main className="max-w-5xl mx-auto px-6 py-20">
            <header className="mb-8">
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

                {frontmatter.coverImage && (
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
                )}
            </header>

            <article className="prose prose-gray max-w-none prose-img:rounded-xl prose-img:shadow-sm">
                {content}
            </article>
        </main>
    );
}
