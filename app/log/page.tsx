import { getAllMdxPosts } from "@/lib/mdxPosts";
import WorkLogClient from "@/components/WorkLogClient";

// 이 페이지는 무조건 정적으로 빌드해라
export const dynamic = "force-static"

// 만약 ISR로 10분마다 다시 생성하고 싶으면(선택):
// export const revalidate = 600; // 600초 = 10분

export default async function LogPage() {
    const mdxPosts = await getAllMdxPosts();
    return <WorkLogClient initialMdxPosts={mdxPosts} query="" />;
}
