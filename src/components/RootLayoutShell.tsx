"use client";

import React, {useEffect} from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import KakaoButton from "@/components/KakaoButton";
import SNSButton from "@/components/SNSButton";
import toast, {Toaster} from "react-hot-toast";

type Props = {
    children: React.ReactNode;
};

export default function RootLayoutShell({ children }: Props) {
    const pathname = usePathname();
    const isLogPage = pathname?.startsWith("/log");

    useEffect(() => {
        toast.dismiss(); // 현재 떠 있는 모든 토스트 제거
    }, [pathname]);

    return (
        <>
            {/* 전역에서 딱 한 번만 사용하는 Toaster */}
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 1500,
                }}
            />

            {/* /log 페이지가 아닐 때만 전역 Header 렌더링 */}
            {!isLogPage && <Header />}

            <main>{children}</main>

            {/* /log에서도 SnsButton + KakaoButton + Footer는 그대로 공통 */}
            <SNSButton />
            <KakaoButton />
            <Footer />
        </>
    );
}
