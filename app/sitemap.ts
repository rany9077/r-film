import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://ran-film.com"; // 실제 도메인

    return [
        {
            url: `${baseUrl}/`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: `${baseUrl}/log`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
        // 나중에 작업 일지 상세 페이지가 생기면 여기에서 동적으로 추가 가능
    ];
}