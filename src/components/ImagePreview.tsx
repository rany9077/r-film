export default function ImagePreview({
                                         images,
                                         alt,
                                         src
                                     }: {
    images?: string[] | null,
    alt: string,
    src?: string
}) {
    if (!images || images.length === 0) return null;
    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
            {images.map((src, i) => (
                <img
                    key={i}
                    src={src}
                    alt={`${alt}-${i}`}
                    className="w-full h-auto rounded-lg border border-gray-100 object-contain"
                />
            ))}
        </div>
    );
}
