"use client";

import Image from "next/image";

type Item = {
    src: string;
    alt: string;
    label?: string; // ➜ before / after 추가용
};

export default function ImageRow({ images }: { images: Item[] }) {
    return (
        <div className="flex gap-6 my-8 flex-wrap justify-center">
            {images.map((img) => (
                <figure key={img.src} className="flex flex-col items-center">
                    <Image
                        src={img.src}
                        alt={img.alt}
                        width={300}
                        height={220}
                        className="rounded-xl shadow-md w-auto h-auto max-w-full"
                    />
                    {img.label && (
                        <figcaption className="mt-2 text-sm text-gray-500 font-medium">
                            {img.label}
                        </figcaption>
                    )}
                </figure>
            ))}
        </div>
    );
}
