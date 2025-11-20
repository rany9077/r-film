import { getAllMdxPosts } from "@/lib/mdxPosts";
import WorkLogClient from "@/components/WorkLogClient";

export default async function LogPage() {
    const mdxPosts = await getAllMdxPosts();

    return <WorkLogClient initialMdxPosts={mdxPosts} query={""} />;
}
