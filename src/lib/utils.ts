import { Timestamp } from "firebase/firestore";

// 날짜 포맷
export function formatDate(value?: string | Timestamp | null): string {
    if (!value) return "-";

    try {
        // Firestore Timestamp 객체인 경우
        if (value instanceof Timestamp) {
            return value.toDate().toLocaleString();
        }

        // 문자열(ISO)인 경우
        const date = new Date(value);
        if (!isNaN(date.getTime())) return date.toLocaleString();

        return "-";
    } catch {
        return "-";
    }
}


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