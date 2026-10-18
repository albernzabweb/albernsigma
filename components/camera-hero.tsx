"use client";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
const Scene = dynamic(() => import("./camera-scene"), {
  ssr: false,
  loading: () => (
    <div className="scene-loading">
      <div className="spinner" />
      <span>Menyiapkan studio 3D…</span>
    </div>
  ),
});
class Boundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? this.props.fallback : this.props.children;
  }
}
function StaticCamera() {
  return (
    <Image
      width={520}
      height={360}
      unoptimized
      className="static-camera"
      src="/products/kamera-lensa.svg"
      alt="Ilustrasi kamera mirrorless, pengganti tampilan 3D"
    />
  );
}
export function CameraHero() {
  const [ready, setReady] = useState(false);
  const [supported, setSupported] = useState(false);
  const [visible, setVisible] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    setSupported(Boolean(gl));
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    setReady(true);
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    if (ref.current) observer.observe(ref.current);
    const change = () =>
      setVisible(
        !document.hidden &&
          Boolean(
            ref.current && ref.current.getBoundingClientRect().bottom > 0,
          ),
      );
    document.addEventListener("visibilitychange", change);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", change);
    };
  }, []);
  return (
    <div
      className="camera-stage"
      ref={ref}
      role="img"
      aria-label="Ilustrasi kamera 3D prosedural yang merespons gerakan kursor"
    >
      <Boundary fallback={<StaticCamera />}>
        {ready && supported ? <Scene active={visible} /> : <StaticCamera />}
      </Boundary>
      <span className="procedural-note">ILUSTRASI 3D PROSEDURAL</span>
    </div>
  );
}
