import { useState } from "react";

interface LuxuryImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function LuxuryImage({
  src,
  alt,
  className = "w-full h-full object-cover",
  fallbackTitle = "ACACIA",
}: LuxuryImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#EDE6DA] via-[#E2D9C8] to-[#D6C9B2] text-[#0E0D0C]/70 p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          aria-hidden="true"
          className="mb-3 text-[#9E7B36]"
        >
          <rect x="13" y="4" width="10" height="5" rx="1" stroke="currentColor" strokeWidth="1.25" />
          <path d="M15 9H21V12H15V9Z" stroke="currentColor" strokeWidth="1.25" />
          <rect x="8" y="12" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="1.25" />
        </svg>
        <span className="font-display text-lg tracking-wide text-[#0E0D0C]">
          {fallbackTitle}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
