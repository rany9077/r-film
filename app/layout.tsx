import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import localFont from "next/font/local";
import { AuthProvider } from "@/contexts/AuthContext";
import RootLayoutShell from "@/components/RootLayoutShell";

const SITE_URL = "https://ran-film.com";
const SITE_NAME = "R.FILM";
const SITE_TITLE = "R.FILM - 인테리어 필름 스튜디오";
const SITE_DESCRIPTION =
    "도어, 가구, 주방, 몰딩까지 과하지 않은 리폼을 지향하는 인테리어 필름 스튜디오 R.FILM 입니다.";

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