import { getSupabaseClient } from "@/lib/supabaseClient";
import { uploadDataUrlsToSupabase } from "@/lib/supabaseUpload";

/** 여러 장 이미지를 위한 타입 */
export type NewPost = {
    title: string;
    content: string;
    imageUrls?: string[];
};

export type PostRow = {
    id: string;
    user_id: string;
    title: string;
    content: string;
    image_urls: string[] | null;
    created_at: string;
    updated_at: string;
};

/**
 * 내 글 목록 구독
 * - 최초 1회 fetch
 * - 이후 Supabase Realtime 으로 posts 테이블 변경 감지 → 다시 fetch 후 cb 호출
 */
export function listenMyPosts(uid: string, cb: (docs: any[]) => void) {
    const supabase = getSupabaseClient();
    if (!supabase) {
        console.warn("[listenMyPosts] Supabase is not available");
        return () => {};
    }

    let cancelled = false;

    const mapRows = (rows: PostRow[]) =>
        rows.map((row) => ({
            id: row.id,
            userId: row.user_id,
            title: row.title,
            content: row.content,
            imageUrls: row.image_urls ?? [],
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            source: "supabase" as const,
        }));

    const fetchAndEmit = async () => {
        const { data, error } = await supabase
            .from("posts")
            .select("*")
            .eq("user_id", uid)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("[listenMyPosts] fetch error", error);
            return;
        }

        if (!cancelled && data) {
            cb(mapRows(data as PostRow[]));
        }
    };

    // 1) 최초 1회 조회
    void fetchAndEmit();

    // 2) Realtime 구독: posts 테이블에서 해당 user_id 행에 대해 insert/update/delete 발생 시 재조회
    const channel = supabase
        .channel(`posts_user_${uid}`)
        .on(
            "postgres_changes",
            {
                event: "*",                  // "INSERT" | "UPDATE" | "DELETE" 다 받기
                schema: "public",
                table: "posts",
                filter: `user_id=eq.${uid}`, // 이 유저의 글만
            },
            () => {
                // 변경이 감지되면 다시 전체 목록 fetch → cb 호출
                void fetchAndEmit();
            }
        )
        .subscribe((status) => {
            if (status === "SUBSCRIBED") {
                console.log("[listenMyPosts] Realtime subscribed");
            }
        });

    // 3) 컴포넌트 언마운트 시 정리
    return () => {
        cancelled = true;
        supabase.removeChannel(channel); // Supabase JS v2 기준
    };
}

/**
 * 글 생성
 * - posts 테이블에 기본 정보 insert
 * - imageUrls에 data URL이 있으면 Supabase Storage에 업로드 후 image_urls 컬럼 업데이트
 */
export async function createPost(uid: string, data: NewPost) {
    const supabase = getSupabaseClient();
    if (!supabase) {
        console.error("[createPost] Supabase is not available");
        return;
    }

    // 1) 기본 글 먼저 생성 (id 확보용)
    const { data: inserted, error: insertError } = await supabase
        .from("posts")
        .insert({
            user_id: uid,
            title: data.title,
            content: data.content ?? "",
            image_urls: [],
        })
        .select("*")
        .single();

    if (insertError || !inserted) {
        console.error("[createPost] insert error", insertError);
        return;
    }

    const postId = inserted.id as string;

    // 2) 이미지가 없으면 여기서 끝
    if (!data.imageUrls || data.imageUrls.length === 0) {
        return postId;
    }

    // 3) data URL → Supabase Storage 업로드
    const pathPrefix = `images/${uid}/${postId}_`; // images/uid/postId_0.png ...
    const uploadedUrls = await uploadDataUrlsToSupabase(
        pathPrefix,
        data.imageUrls
    );

    // 4) image_urls 컬럼 업데이트
    if (uploadedUrls.length > 0) {
        const { error: updateError } = await supabase
            .from("posts")
            .update({
                image_urls: uploadedUrls,
            })
            .eq("id", postId);

        if (updateError) {
            console.error("[createPost] update image_urls error", updateError);
        }
    }

    return postId;
}

/**
 * 글 수정
 * - imageUrls가 넘어오면 배열 전체를 재구성
 *   - data URL인 항목은 Supabase에 새로 업로드
 *   - 이미 URL인 항목은 그대로 유지
 */
export async function updatePost(uid: string, id: string, data: NewPost) {
    const supabase = getSupabaseClient();
    if (!supabase) {
        console.error("[updatePost] Supabase is not available");
        return;
    }

    const payload: any = {
        title: data.title,
        content: data.content ?? "",
        updated_at: new Date().toISOString(),
    };

    if (data.imageUrls) {
        const finalUrls: string[] = [];
        const dataUrlsToUpload: string[] = [];

        for (let i = 0; i < data.imageUrls.length; i++) {
            const val = data.imageUrls[i];
            if (!val) continue;

            if (val.startsWith("data:")) {
                // 업로드 대상
                dataUrlsToUpload.push(val);
            } else {
                // 이미 URL인 항목은 그대로 유지
                finalUrls.push(val);
            }
        }

        if (dataUrlsToUpload.length > 0) {
            const pathPrefix = `images/${uid}/${id}_`;
            const uploadedUrls = await uploadDataUrlsToSupabase(
                pathPrefix,
                dataUrlsToUpload
            );
            finalUrls.push(...uploadedUrls);
        }

        payload.image_urls = finalUrls;
    }

    const { error } = await supabase.from("posts").update(payload).eq("id", id);

    if (error) {
        console.error("[updatePost] update error", error);
    }
}

/** 글 삭제 */
export async function deletePost(uid: string, id: string) {
    const supabase = getSupabaseClient();
    if (!supabase) {
        console.error("[deletePost] Supabase is not available");
        return;
    }

    const { error } = await supabase.from("posts").delete().eq("id", id);

    if (error) {
        console.error("[deletePost] error", error);
    }
}
