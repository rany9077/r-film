"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import KakaoButton from "@/components/KakaoButton";

type Props = {
    children: React.ReactNode;
};

export default function RootLayoutShell({ children }: Props) {
    const pathname = usePathname();
    const isLogPage = pathname?.startsWith("/log");

    return (
        <>
            {/* /log 페이지가 아닐 때만 전역 Header 렌더링 */}
            {!isLogPage && <Header />}

            <main>{children}</main>

            {/* /log에서도 KakaoButton + Footer는 그대로 공통 */}
            <KakaoButton />
            <Footer />
        </>
    );
}
