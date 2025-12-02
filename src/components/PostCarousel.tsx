"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/zoom";

import PostCard from "@/components/PostCard";
import type { Post } from "@/types/post";

type Props = {
    /** 슬라이드에 돌릴 글 목록 */
    posts: Post[];
    isAuthor: boolean;
    onEditAction: (p: Post) => void;
    onDeleteAction: (id: string) => void;
};

export default function PostCarousel({
                                         posts,
                                         isAuthor,
                                         onEditAction,
                                         onDeleteAction,
                                     }: Props) {
    if (!posts || posts.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white py-10 text-center text-sm text-gray-500">
                아직 등록된 시공 일지가 없습니다.
            </div>
        );
    }

    return (
        <Swiper
            modules={[Navigation, Pagination]}
            zoom={true}
            loop
            centeredSlides
            spaceBetween={16}
            slidesPerView={1}
            navigation={{
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            }}
            pagination={{
                el: ".swiper-pagination",
                clickable: true,
            }}
            breakpoints={{
                768: {
                    slidesPerView: 1,
                    spaceBetween: 28,
                },
                1024: {
                    slidesPerView: 1,
                    spaceBetween: 32,
                },
            }}
            className="w-full max-w-2xl mx-auto"
        >
            {posts.map((post) => (
                <SwiperSlide key={post.id}>
                    {/* 여기서는 Post 한 개씩만 넘김 */}
                    <div className="swiper-zoom-container">
                        <PostCard
                            post={post}
                            isAuthor={isAuthor}
                            onEditAction={onEditAction}
                            onDeleteAction={onDeleteAction}
                        />
                    </div>
                </SwiperSlide>
                ))}

            {/* 커스텀 네비게이션 버튼 */}
            <div className="swiper-button-prev custom-swiper-nav" />
            <div className="swiper-button-next custom-swiper-nav" />

            {/* 커스텀 도트 */}
            <div className="swiper-pagination custom-swiper-pagination" />
        </Swiper>
    );
}
