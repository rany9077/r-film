import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // 구글 업로드 이미지도 필요하면
      },
      {
        protocol: "https",
        hostname: "ggdnnyervtxxwkrpwycm.supabase.co", // supabase 업로드 이미지도 필요하면+
        pathname: "/storage/v1/object/public/**",
      }
    ],
  },
};

export default nextConfig;
