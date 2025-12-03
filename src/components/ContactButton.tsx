"use client";

import Link from "next/link";

export default function ContactButton() {
    return (
        <Link href="/contact" rel="noreferrer noopener" className="fixed right-4 bottom-36 z-40 group" aria-label="문의하기">
            <div className="
                h-14 w-14 rounded-full shadow-md
                bg-white flex items-center justify-center hover:scale-105 px-[7px] py-2.5 text-3xl"
            >
                ❓
            </div>
        </Link>
    );
}
