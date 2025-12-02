"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import {Autoplay, EffectFade, Navigation, Pagination} from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

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
        <div className="relative w-full max-w-2xl mx-auto px-0!">
            {/* 네비 버튼을 Swiper 밖에 둠 */}
            <div className="swiper-button-prev custom-swiper-nav"/>
            <div className="swiper-button-next custom-swiper-nav"/>

            <Swiper
                modules={[Navigation, Pagination, Autoplay, EffectFade,]}
                loop
                effect="fade"
                fadeEffect={{ crossFade: true }}
                autoplay={{
                    delay: 2500,
                    disableOnInteraction: false,
                }}
                navigation={{
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                }}
                pagination={{
                    el: ".swiper-pagination",
                    clickable: true,
                }}
                onSwiper={(swiper) => {
                    // 네비/오토플레이 초기화 이슈 방지용 안전장치
                    setTimeout(() => {
                        if (swiper.navigation) {
                            swiper.navigation.init();
                            swiper.navigation.update();
                        }
                        if (swiper.autoplay) {
                            swiper.autoplay.stop();
                            swiper.autoplay.start();
                        }
                    }, 0);
                }}
                className="w-full overflow-hidden rounded-2xl bg-black/5"
            >
                {posts.map((post) => (
                    <SwiperSlide key={post.id}>
                        <PostCard
                            post={post}
                            isAuthor={isAuthor}
                            onEditAction={onEditAction}
                            onDeleteAction={onDeleteAction}
                        />
                    </SwiperSlide>
                ))}

                {/* pagination은 Swiper 안에 둬도 됨 */}
                <div className="swiper-pagination"/>
            </Swiper>
        </div>

    );
}
