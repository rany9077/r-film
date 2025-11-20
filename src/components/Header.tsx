"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Search } from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import CTAButton from "@/components/CTAButton";

const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID;

type HeaderProps = {
    query?: string;
    onQueryChangeAction?: (v: string) => void;
    onClickWriteAction?: () => void;
};

export default function Header({
                                   query = "",
                                   onQueryChangeAction = () => {},
                                   onClickWriteAction = () => {},
                               }: HeaderProps = {}) {
    const { user, signInWithGoogleAction, signOutAction } = useAuth();
    const [showSearch, setShowSearch] = useState(false);

    const pathname = usePathname();
    const showSearchInput = pathname === "/log";

    // 로그인 여부
    const isLoggedIn = !!user;
    const isAdmin = isLoggedIn && !!ADMIN_UID ? user!.uid === ADMIN_UID : false;

    return (
        <>
            <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur border-b border-gray-200 pt-[env(safe-area-inset-top)]">
                <div className="max-w-5xl mx-auto px-6 py-3 flex items-center">
                    <Link href="/" aria-label="메인">
                        <Image
                            src="/logo.png"
                            alt="로고"
                            width={108}
                            height={39}
                            priority
                            className="object-contain w-[96px] sm:w-[108px] h-auto"
                        />
                    </Link>

                    <div className="ml-auto flex items-center gap-2 shrink-0">

                        {/* PC: input 표시 / 모바일: 아이콘만 */}
                        {showSearchInput && (
                        <input
                            value={query}
                            onChange={(e) => onQueryChangeAction(e.target.value)}
                            placeholder="검색(제목·내용)"
                            className="hidden sm:block w-64 rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-black/20"
                        />
                        )}

                        {/* 모바일 검색 아이콘 */}
                        {showSearchInput && (
                        <button
                            type="button"
                            onClick={() => setShowSearch(!showSearch)} // 클릭 시 열고 닫기 토글
                            className="p-2 rounded-full hover:bg-gray-100 sm:hidden"
                            aria-label="검색 열기"
                        >
                            <Search size={20}/>
                        </button>
                        )}

                        {/* 관리자 페이지 버튼: 관리자 UID만 노출 */}
                        {isAdmin && (
                            <a
                                href="/admin/inquiries"
                                className="px-4 py-2 leading-6 rounded-full border border-gray-300 text-sm font-medium bg-gray-300"
                            >
                                관리자
                            </a>
                        )}

                        {/* 문의하기 버튼 */}
                        {!isAdmin && (
                            <Link
                                href="/contact"
                            >
                                <CTAButton>
                                문의하기
                                </CTAButton>
                            </Link>
                        )}

                        {/* 로그인 / 로그아웃 */}
                        {isLoggedIn ? (
                            <button
                                onClick={signOutAction}
                                className="
                                inline-flex items-center justify-center leading-6
                                px-4 py-2
                                text-sm font-medium
                                text-gray-800
                                border border-gray-300
                                rounded-full
                                hover:bg-black
                                hover:text-white
                                transition-all
                                duration-200
                              "
                            >
                                로그아웃
                            </button>
                        ) : (
                            <button
                                onClick={signInWithGoogleAction}
                                className="
                                inline-flex items-center justify-center leading-6
                                px-4 py-2
                                text-sm font-medium
                                text-gray-800
                                border border-gray-300
                                rounded-full
                                hover:bg-black
                                hover:text-white
                                transition-all
                                duration-200
                              "
                            >
                                로그인
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* 모바일 전용 dim + 중앙 검색창 */}
            {showSearch && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center sm:hidden transition-opacity duration-200"
                    onClick={() => setShowSearch(false)} // dim 클릭 시 닫기
                >
                    <div
                        className="w-[90%] max-w-sm rounded-lg bg-white shadow-lg p-4 flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()} // 내부 클릭 시 dim 닫힘 방지
                    >
                        <input
                            autoFocus
                            value={query}
                            onChange={(e) => onQueryChangeAction(e.target.value)}
                            placeholder="검색어를 입력하세요"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-black/30"
                        />
                        <button
                            onClick={() => setShowSearch(false)} // 아이콘 클릭 시 닫기
                            className="p-2 rounded-full bg-black text-white hover:opacity-90"
                            aria-label="검색 닫기"
                        >
                            <Search size={18} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
