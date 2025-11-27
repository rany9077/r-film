import { getSupabaseClient } from "@/lib/supabaseClient";

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

        // data URL → Blob
        const res = await fetch(dataUrl);
        const blob = await res.blob();

        const filePath = `${pathPrefix}${i}.png`; // 예: images/uid/postId_0.png

        const { error } = await supabase.storage
            .from(BUCKET)
            .upload(filePath, blob, {
                upsert: true,
                cacheControl: "31536000",
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
