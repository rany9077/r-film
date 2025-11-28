import { getSupabaseClient } from "@/lib/supabaseClient";
import imageCompression from "browser-image-compression";

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET!;

/**
 * data URL 배열을 Supabase Storage에 업로드하고 public URL 배열을 반환
 * - pathPrefix: 예) "images/uid/docId_"
 */
export async function uploadDataUrlsToSupabase(
    pathPrefix: string,
    dataUrls: string[]
): Promise<string[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
        console.error("[Supabase] 클라이언트 없음");
        return [];
    }

    const urls: string[] = [];

    for (let i = 0; i < dataUrls.length; i++) {
        const dataUrl = dataUrls[i];
        if (!dataUrl || !dataUrl.startsWith("data:")) continue;

        // 1) data URL → Blob
        const res = await fetch(dataUrl);
        const blob = await res.blob();

        // 2) Blob → File (압축 라이브러리가 File을 기대해서)
        const file = new File([blob], `image_${i}.jpg`, {
            type: blob.type || "image/jpeg",
        });

        // 3) 브라우저에서 선압축
        //    - maxSizeMB: 0.3 → 300KB 이하 목표
        //    - maxWidthOrHeight: 1600px로 리사이즈
        const compressed = await imageCompression(file, {
            maxSizeMB: 0.3,
            maxWidthOrHeight: 1600,
            useWebWorker: true,
        });

        // 4) Supabase에 업로드 (확장자는 jpg 그대로 사용해도 OK)
        const filePath = `${pathPrefix}${i}.jpg`; // 예: images/uid/postId_0.jpg

        const { error } = await supabase.storage
            .from(BUCKET)
            .upload(filePath, compressed, {
                upsert: true,
                cacheControl: "31536000",
                contentType: compressed.type || "image/jpeg",
            });

        if (error) {
            console.error("[Supabase upload] 실패", error);
            continue;
        }

        const {
            data: { publicUrl },
        } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

        urls.push(publicUrl);
    }

    return urls;
}
