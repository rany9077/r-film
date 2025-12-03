import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import localFont from "next/font/local";
import { AuthProvider } from "@/contexts/AuthContext";
import RootLayoutShell from "@/components/RootLayoutShell";

const SITE_URL = "https://ran-film.com";
const SITE_NAME = "R.FILM";
const SITE_TITLE = "란 필름 | R.FILM - 인테리어 필름 스튜디오";
const SITE_DESCRIPTION =
    "문짝·싱크대·가구·몰딩 등 집안 전체를 깔끔하게 리폼하는 인테리어 필름 스튜디오 R.FILM, 란 필름입니다. 과하지 않은 디자인과 견고한 마감으로 자연스러운 공간 변화를 제공합니다.";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: SITE_TITLE,
        template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    openGraph: {
        type: "website",
        url: SITE_URL,
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
        siteName: SITE_NAME,
        images: [
            {
                url: "/thum_v3.jpg",
                width: 1200,
                height: 630,
                alt: "R.FILM 인테리어 필름 시공",
            },
        ],
    },
    robots: {
        index: true,
        follow: true,
    },
    alternates: {
        canonical: SITE_URL,
    },
    twitter: {
        card: "summary_large_image",
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
        images: ["/thum_v3.jpg"],
    },
    keywords: [
        "인테리어 필름",
        "인테리어필름 시공",
        "란 필름",
        "문짝 리폼",
        "싱크대 필름",
        "가구 리폼",
        "몰딩 필름",
        "R.FILM",
        "서울 인테리어 필름",
        "필름 시공 가격",
        "리폼 필름"
    ],
};

const pretendard = localFont({
    src: [
        {
            path: "../public/fonts/PretendardVariable.woff2",
            weight: "45 920", // variable 폰트 범위
            style: "normal",
        },
    ],
    variable: "--font-pretendard",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko" className={pretendard.variable}>
        <head>
            <title>{SITE_TITLE}</title>

            <meta
                name="naver-site-verification"
                content="b5e3693f38945df34a013b79434b12e8c7ef4519"
            />
        </head>
        <body suppressHydrationWarning>
        <AuthProvider>
            <RootLayoutShell>{children}</RootLayoutShell>
        </AuthProvider>
        </body>
        </html>
    );
}
