"use client";

import React, { useEffect, useState } from "react";
import { AnalogClock } from "@hoseinh/react-analog-clock";

type RealClockProps = {
    styleType: "minimal" | "modern" | "retro";
    size?: number | string;
};

export default function RealClock({ styleType, size = 200 }: RealClockProps) {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Map styleType thành màu và kiểu số
    const getClockProps = () => {
        switch (styleType) {
            case "minimal":
                return {
                    showSecondHand: false,
                    numbersType: "dots" as const,
                    backgroundColor: "#1E1E1E",
                    handColor: { hour: "#C7A36B", minute: "#C7A36B", second: "#C7A36B" },
                };
            case "modern":
                return {
                    showSecondHand: true,
                    numbersType: "numbers" as const,
                    backgroundColor: "#111827",
                    handColor: { hour: "#ffffff", minute: "#ffffff", second: "#C7A36B" },
                };
            case "retro":
                return {
                    showSecondHand: true,
                    numbersType: "roman" as const,
                    backgroundColor: "#F5F0E1",
                    handColor: { hour: "#333333", minute: "#333333", second: "#FF4D4D" },
                };
            default:
                return {
                    showSecondHand: true,
                    numbersType: "numbers" as const,
                    backgroundColor: "#111827",
                    handColor: { hour: "#ffffff", minute: "#ffffff", second: "#C7A36B" },
                };
        }
    };


    const clockProps = getClockProps();

    return (
        <div className="flex flex-col items-center select-none">
            <AnalogClock
                size={typeof size === "number" ? `${size}px` : size}
                showSecondHand={clockProps.showSecondHand}
                numbersType={clockProps.numbersType}
                backgroundColor={clockProps.backgroundColor}
                handColor={clockProps.handColor}
                smooth
            />
        </div>
    );
}
