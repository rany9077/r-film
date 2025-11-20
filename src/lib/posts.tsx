import { db, storage } from "@/lib/firebase";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";

/** 여러 장 이미지를 위한 타입 */
export type NewPost = {
    title: string;
    content: string;
    // data URL 배열 (ex: ["data:image/png;base64,...", ...])
    imageUrls?: string[];
};

export function listenMyPosts(uid: string, cb: (docs: any[]) => void) {
    const col = collection(db, `users/${uid}/posts`);
    const q = query(col, orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
        cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });
}

/**
 * 글 생성
 * - 기본 문서 먼저 생성
 * - imageUrls에 data URL 이 있으면 Storage에 업로드 후 Firestore에 실제 URL 저장
 */
export async function createPost(uid: string, data: NewPost) {
    const col = collection(db, `users/${uid}/posts`);

    const base = {
        title: data.title,
        content: data.content ?? "",
        imageUrls: [] as string[], // 여러 장 URL을 담을 배열
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    // 1) 우선 문서 생성
    const docRef = await addDoc(col, base);

    // 2) 이미지가 없으면 바로 리턴
    if (!data.imageUrls || data.imageUrls.length === 0) {
        return docRef.id;
    }

    // 3) data URL → Storage 업로드 후 다운로드 URL 배열 생성
    const uploadedUrls: string[] = [];

    for (let i = 0; i < data.imageUrls.length; i++) {
        const imageData = data.imageUrls[i];
        if (!imageData || !imageData.startsWith("data:")) continue;

        const storageRef = ref(storage, `images/${uid}/${docRef.id}_${i}.png`);
        await uploadString(storageRef, imageData, "data_url");
        const url = await getDownloadURL(storageRef);
        uploadedUrls.push(url);
    }

    // 4) Firestore 문서에 imageUrls 필드 업데이트
    if (uploadedUrls.length > 0) {
        await updateDoc(doc(db, `users/${uid}/posts/${docRef.id}`), {
            imageUrls: uploadedUrls,
            updatedAt: serverTimestamp(),
        });
    }

    return docRef.id;
}

/**
 * 글 수정
 * - imageUrls가 넘어오면 배열 전체를 재구성
 *   - data URL인 항목은 새로 업로드
 *   - 이미 URL인 항목은 그대로 유지
 */
export async function updatePost(uid: string, id: string, data: NewPost) {
    const payload: any = {
        title: data.title,
        content: data.content ?? "",
        updatedAt: serverTimestamp(),
    };

    if (data.imageUrls) {
        const finalUrls: string[] = [];

        for (let i = 0; i < data.imageUrls.length; i++) {
            const val = data.imageUrls[i];
            if (!val) continue;

            if (val.startsWith("data:")) {
                // 새로 업로드 해야 하는 이미지
                const storageRef = ref(storage, `images/${uid}/${id}_${i}.png`);
                await uploadString(storageRef, val, "data_url");
                const url = await getDownloadURL(storageRef);
                finalUrls.push(url);
            } else {
                // 이미 업로드된 URL 그대로 사용
                finalUrls.push(val);
            }
        }

        payload.imageUrls = finalUrls;
    }

    await updateDoc(doc(db, `users/${uid}/posts/${id}`), payload);
}

/** 글 삭제 (Storage 이미지까지 지우려면 여기에 삭제 로직 추가 가능) */
export async function deletePost(uid: string, id: string) {
    await deleteDoc(doc(db, `users/${uid}/posts/${id}`));
}
