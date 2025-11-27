// 이미지 업로드 전에 DataURL 변환
export async function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export function cn(...classes: (string | undefined | false | null)[]) {
    return classes.filter(Boolean).join(" ");
}