export type PostSource = "mdx" | "supabase";

export type Post = {
    id: string;
    title: string;
    content: string;
    imageUrls?: string[];
    summary?: string;
    createdAt: string;
    coverImage?: string;
    source: PostSource;
};

export type MdxPost = {
    id: string;
    title: string;
    summary?: string;
    createdAt: string;
    coverImage?: string | null;
    source: "mdx";
};
