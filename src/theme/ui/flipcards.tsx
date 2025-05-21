import React, { useState } from "react";

interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
}

export function FlipCard({ front, back, className = "" }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      className={`flip-card w-full h-full ${className}`}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      tabIndex={0}
      onFocus={() => setFlipped(true)}
      onBlur={() => setFlipped(false)}
      style={{ outline: 'none', perspective: 1000 }}
    >
      <div className={`flip-card-inner w-full h-full transition-transform duration-500 ${flipped ? "flipped" : ""}`}>
        <div className="flip-card-front w-full h-full flex flex-col items-center justify-center bg-gray-900 rounded-xl shadow-lg absolute inset-0 backface-hidden">
          {front}
        </div>
        <div className="flip-card-back w-full h-full flex flex-col items-center justify-center bg-gray-800 rounded-xl shadow-lg absolute inset-0 backface-hidden transform rotateY-180">
          {back}
        </div>
      </div>
      <style jsx>{`
        .flip-card {
          perspective: 1000px;
          position: relative;
        }
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.5s;
          transform-style: preserve-3d;
        }
        .flip-card-inner.flipped {
          transform: rotateY(180deg);
        }
        .flip-card-front, .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .flip-card-back {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}

// Card section components (same as Card)
interface CardSectionProps {
  className?: string;
  children: React.ReactNode;
}

export function FlipCardHeader({ className = "", children }: CardSectionProps) {
  return (
    <div className={`px-6 py-4 bg-gradient-to-r from-[#ff3c00]/80 to-[#ff6a00]/80 text-white font-semibold text-lg shadow-md ${className}`}>
      {children}
    </div>
  );
}
export function FlipCardContent({ className = "", children }: CardSectionProps) {
  return <div className={`px-6 py-4 flex-1 ${className}`}>{children}</div>;
}
export function FlipCardFooter({ className = "", children }: CardSectionProps) {
  return <div className={`px-6 py-3 bg-white/10 dark:bg-gray-800/60 ${className}`}>{children}</div>;
}
export function FlipCardActions({ className = "", children }: CardSectionProps) {
  return <div className={`flex gap-2 px-6 py-3 bg-gradient-to-r from-[#ff3c00]/80 to-[#ff6a00]/80 justify-end ${className}`}>{children}</div>;
}
