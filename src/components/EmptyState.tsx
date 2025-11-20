export default function EmptyState({ onCreateAction }: { onCreateAction: () => void }) {
    return (
        <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-2xl">
            <p className="text-gray-500 mb-4">아직 작성된 글이 없습니다.</p>
            <button onClick={onCreateAction} className="px-4 py-2 rounded-lg bg-black text-white hover:opacity-90">글쓰기</button>
        </div>
    );
}