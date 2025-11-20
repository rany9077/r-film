"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

type Props = {
    children: React.ReactNode;
    className?: string;
    delay?: number;   // 초 단위(0.1 = 100ms)
    y?: number;       // 얼마나 아래에서 올라올지 px
};

export default function FadeInSection({
                                          children,
                                          className = "",
                                          delay = 0,
                                          y = 30,
                                      }: Props) {
    const { ref, inView } = useInView({
        triggerOnce: true,  // 한 번만 실행
        threshold: 0.2,    // 20% 정도 보이면 발동
    });

    return (
        <motion.section
            ref={ref}
            className={className}
            initial={{ opacity: 0, y }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay }}
        >
            {children}
        </motion.section>
    );
}
