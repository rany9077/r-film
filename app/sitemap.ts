// app/sitemap.ts
import { MetadataRoute } from "next";
import { getAllMdxPosts } from "@/lib/mdxPosts"; // 방금 보여준 파일 기준
import type { MdxPost } from "@/types/post";

const SITE_URL = "https://ran-film.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // 1) 정적 페이지들
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: `${SITE_URL}/`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: `${SITE_URL}/log`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
    ];

    // 2) MDX 작업 일지 상세 페이지들
    const posts: MdxPost[] = await getAllMdxPosts();

    const postRoutes: MetadataRoute.Sitemap = posts.map((post) => {
        // createdAt은 getAllMdxPosts에서
        //  - frontmatter의 date
        //  - 없으면 new Date().toISOString()
        // 으로 들어오기 때문에 Date 파싱 가능
        const createdAt = new Date(post.createdAt);
        const lastModified = Number.isNaN(createdAt.getTime())
            ? new Date()
            : createdAt;

        return {
            url: `${SITE_URL}/log/${post.id}`, // 상세 페이지 URL 패턴
            lastModified,
            changeFrequency: "monthly",
            priority: 0.7,
        };
    });

    return [...staticRoutes, ...postRoutes];
}