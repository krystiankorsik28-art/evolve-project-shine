"use client";
import { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";

export function CountUp({ end, duration = 2, suffix = "", prefix = "", className = "", decimals = 0 }: { end: number; duration?: number; suffix?: string; prefix?: string; className?: string; decimals?: number }) {
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
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return <span ref={ref} className={`tabular-nums ${className}`}>{prefix}{count.toLocaleString()}{suffix}</span>;
}
