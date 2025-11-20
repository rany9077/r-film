"use client";

import React, { useEffect, useRef } from "react";
import styles from './cta-button.module.css';
import { cn } from "@/lib/utils"; // 없으면 classNames 라이브러리 사용 가능

export default function CTAButton({
                                      className,
                                      children,
                                      ...props
                                  }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    const ref = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        let start = 0;

        const updateStart = () => {
            if (!ref.current) return;

            start += 1;
            ref.current.style.setProperty("--start", start.toString());

            requestAnimationFrame(updateStart);
        };

        updateStart();
    }, []);

    return (
        <button
            {...props}
            ref={ref}
            className={cn(
                "relative inline-flex px-4 py-[10.5px] items-center justify-center gap-2 text-sm font-medium",
                "text-gray-800 bg-white rounded-xl overflow-hidden",
                "transition-transform hover:scale-[1.03] active:scale-[0.97]",
                styles.border_effect,
                className
            )}
        >
            {children}
        </button>
    );
}
