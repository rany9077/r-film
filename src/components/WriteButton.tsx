"use client";

import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const AUTHOR_UID = process.env.NEXT_PUBLIC_ADMIN_UID;

export default ({onClick}: { onClick: () => void }) => {
    const { user } = useAuth();

    const isAuthor = !!user && user.id === AUTHOR_UID;

    if (!isAuthor) return null; // 작성자만 노출

    return (
        <button
            onClick={onClick}
            className="
            fixed right-4 bottom-36 z-40
            h-14 w-14 rounded-full
            bg-black text-white
            flex items-center justify-center
            shadow-lg hover:scale-105 transition-transform
          "
            aria-label="글쓰기"
        >
            <Plus size={28} />
        </button>
    );
}
