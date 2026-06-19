"use client";
import { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";

export function CountUp({ end, duration = 2, suffix = "", prefix = "", decimals = 0, className = "" }: { end: number; duration?: number; suffix?: string; prefix?: string; decimals?: number; className?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);
  const display = decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString();
  return <span ref={ref} className={`tabular-nums ${className}`}>{prefix}{display}{suffix}</span>;
}
