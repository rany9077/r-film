// lib/mdxPosts.ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import Image from "next/image";
import ImageRow from "@/components/mdx/ImageRow";

const logsDir = path.join(process.cwd(), "content", "logs");

export type MdxPostMeta = {
    id: string;
    title: string;
    summary?: string;
    createdAt: string;
    coverImage?: string | null;
    source: "mdx";
};

export async function getAllMdxPosts(): Promise<MdxPostMeta[]> {
    if (!fs.existsSync(logsDir)) return [];

    const files = fs.readdirSync(logsDir);

    const posts = files
        .filter((file) => file.endsWith(".mdx"))
        .map((file) => {
            const fullPath = path.join(logsDir, file);
            const raw = fs.readFileSync(fullPath, "utf8");
            const { data } = matter(raw);

            const slug = file.replace(/\.mdx$/, "");

            return {
                id: slug,
                title: data.title || slug,
                summary: data.summary || "",
                createdAt: data.date || new Date().toISOString(),
                coverImage: data.coverImage || null,
                source: "mdx" as const,
            };
        });

    posts.sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
    );

    return posts;
}

// 🔥 slug로 MDX 하나 가져오기 + 실제 내용 컴파일
export async function getMdxPostBySlug(slug: string) {
    const fullPath = path.join(logsDir, `${slug}.mdx`);

    if (!fs.existsSync(fullPath)) {
        return null;
    }

    const raw = fs.readFileSync(fullPath, "utf8");

    const { content, data } = matter(raw);

    const mdxCompiled = await compileMDX<{
        title?: string;
        date?: string;
        coverImage?: string;
        summary?: string;
    }>({
        source: content,
        options: {
            parseFrontmatter: false, // 위에서 이미 matter로 파싱함
        },
        // MDX에서 사용할 수 있는 컴포넌트 등록
        components: {
            Image,
            ImageRow
        },
    });

    return {
        slug,
        frontmatter: {
            title: data.title ?? slug,
            date: data.date ?? null,
            coverImage: data.coverImage ?? null,
            summary: data.summary ?? "",
        },
        content: mdxCompiled.content, // ReactNode
    };
}
