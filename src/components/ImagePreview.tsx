export default function ImagePreview({
                                         images,
                                         alt,
                                     }: {
    images?: string[] | null,
    alt: string,
}) {
    if (!images || images.length === 0) return null;
    return (
        <div>
            {images.map((src, i) => (
                <img
                    key={i}
                    src={src}
                    alt={`${alt}-${i}`}
                    className="w-full h-auto object-contain mb-2"
                />
            ))}
        </div>
    );
}
