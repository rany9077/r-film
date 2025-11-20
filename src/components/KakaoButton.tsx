"use client";

import { KAKAO_CHAT_URL } from "@/config";
import React from "react";
import Link from "next/link";


export default function KakaoButton() {
    return (
        <Link href={KAKAO_CHAT_URL} target="_blank" rel="noreferrer noopener" className="fixed right-4 bottom-4 z-40 group" aria-label="카카오톡 문의">
            <div className="h-14 w-14 flex items-center justify-center rounded-full shadow-md bg-yellow-300/90 hover:bg-yellow-300 hover:scale-105 px-[7px] py-2.5 text-3xl">
                💬
            </div>
        </Link>
    );
}