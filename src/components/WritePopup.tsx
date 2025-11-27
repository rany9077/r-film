"use client";
import React, { useRef, useState } from "react";
import { fileToDataUrl } from "@/lib/utils";

export default function WritePopup({
                                       initial,
                                       onSaveAction,
                                       onCloseAction,
                                   }: {
    initial?: Partial<{ title: string; content: string; imageUrls?: string[] }>;
    onSaveAction: (data: { imageUrls: string[]; title: string; content: string }) => void;
    onCloseAction: () => void;
}) {
    const [title, setTitle] = useState(initial?.title ?? "");
    const [content, setContent] = useState(initial?.content ?? "");
    // 여러 장 이미지를 위한 state (기존 URL + 새로 추가된 dataURL 모두 포함)
    const [images, setImages] = useState<string[]>(initial?.imageUrls ?? []);
    const fileRef = useRef<HTMLInputElement | null>(null);

    // 파일 선택 → dataURL 배열로 변환 후 기존 배열에 append
    async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files) return;

        const list: string[] = [];
        for (let file of Array.from(files)) {
            const dataUrl = await fileToDataUrl(file);
            list.push(dataUrl);
        }

        setImages((prev) => [...prev, ...list]);

        // 같은 파일 다시 선택 가능하게 input 초기화
        if (fileRef.current) {
            fileRef.current.value = "";
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim()) return alert("제목을 입력하세요.");

        onSaveAction({
            title,
            content,
            imageUrls: images,
        });
        onCloseAction();
    }

    // 개별 이미지 제거 (선택 기능 필요하면)
    function removeImage(index: number) {
        setImages((prev) => prev.filter((_, i) => i !== index));
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-lg max-h-[80vh] overflow-y-scroll">
                {/* 헤더 */}
                <header className="flex items-center justify-between border-b p-4">
                    <h3 className="text-lg font-semibold">
                        {initial ? "글 수정" : "글 쓰기"}
                    </h3>
                    <button
                        onClick={onCloseAction}
                        className="text-gray-500 hover:text-black"
                    >
                        ✕
                    </button>
                </header>

                {/* 폼 */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm text-gray-500 mb-1">제목</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black/30"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-500 mb-1">내용</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={8}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black/30"
                        />
                    </div>

                    {/* 이미지 영역 */}
                    <div>
                        <label className="block text-sm text-gray-500 mb-1">이미지</label>

                        {/* 선택된 이미지 미리보기 (여러 장) */}
                        {images.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 mt-3">
                                {images.map((src, idx) => (
                                    <div key={idx} className="relative group">
                                        {/* 이미지 */}
                                        <img
                                            src={src}
                                            alt={`image-${idx}`}
                                            className="w-full h-auto rounded-lg border border-gray-200 object-contain"
                                        />

                                        {/* 삭제 버튼(X) */}
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="
                                                absolute top-2 right-2
                                                bg-white text-black
                                                w-7 h-7 rounded-full
                                                flex items-center justify-center
                                            "
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 파일 선택 (여러 장 추가 가능) */}
                        <div className="mt-2">
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFile}
                                className="hidden"
                            />

                            {/* 버튼 UI */}
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                className="mt-2 px-4 py-2 rounded-lg border-gray-300 border text-sm text-gray-500"
                            >
                                🔗이미지 추가
                            </button>
                        </div>
                    </div>

                    {/* 버튼 영역 */}
                    <footer className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onCloseAction}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-black text-white hover:opacity-90"
                        >
                            저장
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
}
