// export type Post = {
//     id: string;
//     title: string;
//     content: string;
//     imageUrls?: string[];
//     createdAt: string;
//     updatedAt: string;
// };

export type PostSource = "mdx" | "firebase";

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