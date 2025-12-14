"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
  targetDate: string;
  className?: string;
}

export function getCountdownMode(targetDate: string): "countdown" | "imminent" | "hidden" {
  const now = Date.now();
  const target = new Date(targetDate).getTime();
  const diff = target - now;

  if (diff <= 0) return "hidden";
  if (diff < 72 * 60 * 60 * 1000) return "imminent";
  return "countdown";
}

export default function Countdown({ targetDate, className = "" }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  const [mode, setMode] = useState<"countdown" | "imminent" | "hidden">("countdown");

  useEffect(() => {
    const updateCountdown = () => {
      const currentMode = getCountdownMode(targetDate);
      setMode(currentMode);

      if (currentMode === "countdown") {
        const now = Date.now();
        const target = new Date(targetDate).getTime();
        const diff = Math.max(0, target - now);

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (mode === "hidden") return null;

  if (mode === "imminent") {
    return (
      <div className={`glassy rounded-xl p-4 ${className}`}>
        <p className="text-amber-300 font-bold text-center">
          🚀 Lancement imminent
        </p>
      </div>
    );
  }

  if (!timeLeft) return null;

  return (
    <div className={`glassy rounded-xl p-4 ${className}`}>
      <p className="text-amber-300 font-bold text-center mb-3">
        🚀 Lancement dans :
      </p>
      <div className="grid grid-cols-4 gap-2 text-center">
        <div>
          <div className="text-2xl font-bold text-white">{timeLeft.days}</div>
          <div className="text-xs text-slate-400">jours</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{timeLeft.hours}</div>
          <div className="text-xs text-slate-400">heures</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{timeLeft.minutes}</div>
          <div className="text-xs text-slate-400">min</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{timeLeft.seconds}</div>
          <div className="text-xs text-slate-400">sec</div>
        </div>
      </div>
    </div>
  );
}
