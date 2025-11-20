"use client";

import React, { useEffect, useState } from "react";

type RollingNumberProps = {
    value: number;          // 목표 숫자 (예: 98)
    duration?: number;      // 전체 애니메이션 시간(ms)
    className?: string;
    suffix?: string;        // %, 명, 건 등
};

export function RollingNumber({
                                  value,
                                  duration = 1200,
                                  className,
                                  suffix,
                              }: RollingNumberProps) {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        // 0부터 다시 시작
        setDisplay(0);

        if (value <= 0) return;

        const totalSteps = value;             // 0 → value 까지 1씩 증가
        const stepTime = Math.max(duration / totalSteps, 16);
        // 너무 빠른 interval 방지 (최소 16ms ≒ 60fps)

        let current = 0;
        const timer = setInterval(() => {
            current += 1;
            setDisplay(current);

            if (current >= value) {
                clearInterval(timer);
            }
        }, stepTime);

        return () => clearInterval(timer);
    }, [value, duration]);

    return (
        <span className={className}>
      {display}
            {suffix && <span>{suffix}</span>}
    </span>
    );
}
