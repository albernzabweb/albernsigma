"use client";
import Image from "next/image";
import { useState } from "react";
export function ProductImage({
  src,
  alt,
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <Image
      src={failed ? "/products/kamera-lensa.svg" : src}
      alt={failed ? `${alt} — ilustrasi pengganti` : alt}
      fill
      sizes="(max-width:640px) 90vw,(max-width:1024px) 45vw,30vw"
      priority={priority}
      className={className}
      onError={() => setFailed(true)}
      unoptimized={src.endsWith(".svg")}
    />
  );
}
