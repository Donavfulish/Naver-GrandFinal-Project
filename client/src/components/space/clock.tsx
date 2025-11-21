// RealClock.tsx
"use client";

import React, { useEffect, useState } from "react";
import { AnalogClock } from "@hoseinh/react-analog-clock";

export type ClockStyleType = "minimal" | "modern" | "retro" | "digital" | "classic" | "futuristic";

type RealClockProps = {
    styleType: ClockStyleType;
    size?: number | string;
};

export default function RealClock({ styleType, size = 200 }: RealClockProps) {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getClockProps = () => {
        const PRIMARY_ACCENT = "#C7A36B";
        const SECONDARY_ACCENT = "#7C9A92";
        const BASE_DARK = "#1E1E1E"; 
        const BASE_LIGHT = "#F8FAFC"; 

        switch (styleType) {
            case "minimal":
                return {
                    showSecondHand: false,
                    numbersType: "dots" as const,
                    backgroundColor: BASE_DARK,
                    handColor: { hour: PRIMARY_ACCENT, minute: PRIMARY_ACCENT, second: BASE_DARK },
                    handWidth: { hour: 2, minute: 1 }, 
                };
            case "modern":
                // ⚙️ Hiện đại, dùng số, kim giây accent nổi bật, kim giờ/phút trắng
                return {
                    showSecondHand: true,
                    numbersType: "numbers" as const,
                    backgroundColor: "#111827", 
                    // Kim giây dùng màu accent chính
                    handColor: { hour: "#ffffff", minute: "#ffffff", second: PRIMARY_ACCENT },
                    handWidth: { hour: 4, minute: 2, second: 1 },
                };
            case "retro":
                // 📻 Cổ điển, dùng số La Mã, nền sáng, kim đen đậm
                return {
                    showSecondHand: true,
                    numbersType: "roman" as const,
                    backgroundColor: "#F5F0E1", 
                    // Kim đen, kim giây đỏ cổ điển
                    handColor: { hour: "#333333", minute: "#333333", second: "#FF4D4D" },
                    handWidth: { hour: 6, minute: 4, second: 1 },
                    borderWidth: 4, // Viền dày hơn
                    borderColor: "#333333"
                };
            case "digital":
                // 🔢 Giả lập Digital (Focus vào số): Kim đậm, màu sắc tương phản mạnh mẽ
                return {
                    showSecondHand: true,
                    numbersType: "numbers" as const,
                    backgroundColor: "#1A5A58", 
                    handColor: { hour: SECONDARY_ACCENT, minute: PRIMARY_ACCENT, second: "red" },
                    handWidth: { hour: 6, minute: 4, second: 2 },
                    centerDotColor: SECONDARY_ACCENT,
                    borderWidth: 4, // Viền dày hơn
                    borderColor: "#333333"
                };
            case "classic":
                // 🎩 Sang trọng: Nền trắng, kim đen cơ bản, kim giây accent phụ
                return {
                    showSecondHand: true,
                    numbersType: "numbers" as const,
                    backgroundColor: BASE_LIGHT, 
                    // Kim đen, kim giây màu accent phụ
                    handColor: { hour: "#333333", minute: "#333333", second: SECONDARY_ACCENT },
                    handWidth: { hour: 5, minute: 3, second: 1 },
                    borderWidth: 2,
                    borderColor: "#333333",
                };
            case "futuristic":
                // 🚀 Tương lai: Kim neon, nền tối, dùng dots (mô phỏng lưới/LED)
                return {
                    showSecondHand: true,
                    numbersType: "dots" as const,
                    backgroundColor: BASE_DARK,
                    // Kim xanh neon, kim giây accent chính
                    handColor: { hour: "#00E0FF", minute: "#00E0FF", second: PRIMARY_ACCENT },
                    handWidth: { hour: 2, minute: 1, second: 1 }, // Kim mảnh hơn
                    borderColor: "#00E0FF",
                };
            default:
                // Giá trị mặc định
                return {
                    showSecondHand: true,
                    numbersType: "numbers" as const,
                    backgroundColor: "#111827",
                    handColor: { hour: "#ffffff", minute: "#ffffff", second: PRIMARY_ACCENT },
                };
        }
    };


    const clockProps = getClockProps();

    return (
        <div className="flex flex-col items-center select-none">
            <AnalogClock
                size={typeof size === "number" ? `${size}px` : size}
                smooth
                {...clockProps} 
            />
        </div>
    );
}