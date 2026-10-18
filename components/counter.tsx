"use client";
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
export function Counter({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  const [n, setN] = useState(value);
  useEffect(() => {
    if (!visible || reduced) return;
    let frame = 0;
    let start: number | undefined;
    const update = (time: number) => {
      start ??= time;
      const p = Math.min((time - start) / 1100, 1);
      setN(Math.round(value * (1 - (1 - p) ** 3)));
      if (p < 1) frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [visible, reduced, value]);
  return (
    <span ref={ref}>
      {new Intl.NumberFormat("id-ID").format(n)}
      {suffix}
    </span>
  );
}
