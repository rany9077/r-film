"use client";

import React from "react";
import Link from "next/link";

const INSTAGRAM_URL = "https://www.instagram.com/ran.film/";

export default function SNSButton() {
    return (
        <Link
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="인스타그램 바로가기"
            className="fixed right-4 bottom-20 z-40 group"
        >
            <div
                className="
                    h-14 w-14
                    flex items-center justify-center
                    rounded-full shadow-md
                    bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]
                    text-white text-2xl
                    transition-transform duration-200
                    hover:scale-105
                "
            >
                {/* 인스타그램 같은 심플한 아이콘 스타일 */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.8"
                >
                    <rect
                        x="3"
                        y="3"
                        width="18"
                        height="18"
                        rx="5"
                        ry="5"
                    ></rect>
                    <circle cx="12" cy="12" r="4"></circle>
                    <circle cx="17" cy="7" r="1.3"></circle>
                </svg>
            </div>
        </Link>
    );
}
