import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import localFont from "next/font/local";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import KakaoButton from "@/components/KakaoButton";


export const metadata: Metadata = {
    metadataBase: new URL("https://r-film.example.com"), // 실제 도메인으로 수정
    title: {
        default: "R.FILM - 인테리어 필름 스튜디오",
        template: "%s | R.FILM",
    },
    description:
        "도어, 가구, 주방, 몰딩까지 과하지 않은 리폼을 지향하는 인테리어 필름 스튜디오 R.FILM입니다.",
    openGraph: {
        type: "website",
        url: "https://r-film.example.com",
        title: "R.FILM - 인테리어 필름 스튜디오",
        description:
            "주거·상업공간 인테리어 필름 시공, 실사례 기반 상담과 꼼꼼한 마감까지 함께 합니다.",
        siteName: "R.FILM",
        images: [
            {
                url: "/logo.png", // 메인 상단 이미지를 기반으로 하나 만들어두면 좋아요
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
        <body suppressHydrationWarning>
        <AuthProvider>
            <Header />
            <main>{children}</main>
            <KakaoButton/>
            <Footer />
        </AuthProvider>
        </body>
        </html>
    );
}