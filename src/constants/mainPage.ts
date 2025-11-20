import {
    Clock3,
    PiggyBank,
    Palette,
    BadgeCheck,
    Leaf,
    Sparkles,
} from "lucide-react";
import React from "react";

export type ProductItem = {
    key: string;
    title: string;
    description: string;
    tag: string;
    cta: string;
    image: string;
};

type FilmBenefit = {
    title: string;
    description: string;
    icon: React.ComponentType<any>;
};


export type ProcessStep = {
    step: string;
    title: string;
    description: string;
};

export type FaqItem = {
    q: string;
    a: string;
};

// 1) 제품 라인업
export const PRODUCT_LINEUP: ProductItem[] = [
    {
        key: "wood",
        title: "우드 패턴 필름",
        description:
            "내추럴한 결감으로 가장 무난하게 사용할 수 있는 우드 계열 필름입니다.",
        tag: "현관·방문·붙박이장",
        cta: "시공 사례 보기",
        image: "/product_wood.jpg",
    },
    {
        key: "marble",
        title: "대리석 패턴 필름",
        description:
            "화이트·그레이 계열의 마블 텍스처로, 주방/욕실 포인트에 많이 쓰입니다.",
        tag: "주방 상판·벽면 포인트",
        cta: "시공 사례 보기",
        image: "/product_marble.jpg",
    },
    {
        key: "metal",
        title: "메탈릭 필름",
        description:
            "살짝 광택이 도는 메탈 계열 필름으로, 모던한 상업 공간과 잘 어울립니다.",
        tag: "카운터·가구 래핑",
        cta: "시공 사례 보기",
        image: "/product_metal.jpg",
    },
    {
        key: "fabric",
        title: "패브릭 패턴 필름",
        description:
            "부드러운 패브릭 질감으로, 침실·거실에 잔잔한 포인트를 줄 때 좋습니다.",
        tag: "침실·거실 포인트",
        cta: "시공 사례 보기",
        image: "/product_fabric.jpg",
    },
    {
        key: "concrete",
        title: "콘크리트 패턴 필름",
        description:
            "무채색 톤의 콘크리트 질감으로, 카페·스튜디오에 많이 사용되는 타입입니다.",
        tag: "카페·스튜디오",
        cta: "시공 사례 보기",
        image: "/product_concrete.jpg",
    },
    {
        key: "tile",
        title: "타일 패턴 필름",
        description:
            "욕실이나 주방에 타일 느낌을 내고 싶을 때, 비교적 가볍게 적용할 수 있습니다.",
        tag: "욕실·주방 벽면",
        cta: "시공 사례 보기",
        image: "/product_tile.jpg",
    },
];

// 2) 인테리어 필름 장점
export const FILM_BENEFITS: FilmBenefit[] = [
    {
        title: "빠른 시공",
        description:
            "철거 없이 기존 마감 위에 바로 시공이 가능해 공사 기간이 짧습니다.",
        icon: Clock3,
    },
    {
        title: "합리적인 가격",
        description:
            "전체 인테리어 공사 대비 부담을 줄이면서도 분위기 변화를 줄 수 있습니다.",
        icon: PiggyBank,
    },
    {
        title: "취향에 딱 맞는 무드",
        description:
            "우드, 대리석, 메탈 등 다양한 패턴으로 공간의 무드를 통일할 수 있습니다.",
        icon: Palette,
    },
    {
        title: "완벽한 마감",
        description:
            "모서리, 곡면, 몰딩 등 신경 쓰이는 부분까지 깔끔하게 정리합니다.",
        icon: BadgeCheck,
    },
    {
        title: "친환경 소재",
        description:
            "검증된 정품 필름만 사용하며, 냄새와 유해 물질을 최소화합니다.",
        icon: Leaf,
    },
    {
        title: "쉬운 관리",
        description:
            "물걸레·중성세제만으로도 관리가 가능해 실사용에 편리합니다.",
        icon: Sparkles,
    },
];

// 3) 시공 프로세스
export const PROCESS_STEPS: ProcessStep[] = [
    {
        step: "01",
        title: "무료 상담",
        description: "카카오톡 또는 문의 폼으로 공간 사진과 함께 기본 정보를 남겨 주세요.",
    },
    {
        step: "02",
        title: "필름·톤 제안",
        description: "사진과 용도에 맞춰 적합한 필름 종류와 톤, 대략적인 예산을 안내드립니다.",
    },
    {
        step: "03",
        title: "현장 실측",
        description:
            "필요 시 방문 실측을 진행하여 실제 사이즈와 상태를 확인하고 최종 견적을 확정합니다.",
    },
    {
        step: "04",
        title: "시공 진행",
        description:
            "합의된 일정에 맞춰 도어·가구·벽면 등 시공 범위에 따라 작업을 진행합니다.",
    },
    {
        step: "05",
        title: "마감 체크",
        description: "작업 이후 모서리, 문틀, 열림/닫힘 상태 등 디테일을 함께 확인합니다.",
    },
    {
        step: "06",
        title: "A/S 보증",
        description: "정해진 기간 내 들뜸이나 박리 문제가 생기면 사진 확인 후 A/S를 진행합니다.",
    },
];

// 4) FAQ
export const FAQ_ITEMS: FaqItem[] = [
    {
        q: "시공 비용은 어떻게 정해지나요?",
        a: "시공 면적, 난이도(몰딩/곡면 여부), 사용 필름 종류에 따라 달라집니다. 보통은 공간 사진과 대략적인 사이즈를 먼저 공유받고, 대략적인 범위를 안내드린 뒤 현장 방문 시 최종 견적을 확정합니다.",
    },
    {
        q: "시공 시간은 어느 정도 걸리나요?",
        a: "도어 1~2짝 정도는 반나절 이내, 현관/신발장·붙박이장까지 포함된 경우 1~2일 정도를 넉넉히 보고 있습니다. 공간 구조, 기존 마감 상태에 따라 시간이 달라질 수 있습니다.",
    },
    {
        q: "A/S는 어떻게 진행되나요?",
        a: "시공 후 일정 기간 내 들뜸/박리 등이 발생하면 사진 확인 후 방문 A/S를 진행합니다. 사용 부주의나 강한 외부 충격에 의한 손상은 별도 비용이 발생할 수 있습니다.",
    },
];
