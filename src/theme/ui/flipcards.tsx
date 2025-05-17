import React, { useState, isValidElement, cloneElement, ReactElement } from "react";

interface FlipCardProps {
  flipped?: boolean;
  onFlip?: (flipped: boolean) => void;
  className?: string;
  children: React.ReactNode;
}

export function FlipCard({ flipped: flippedProp, onFlip, className = "", children }: FlipCardProps) {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const isControlled = flippedProp !== undefined;
  const flipped = isControlled ? flippedProp : internalFlipped;

  const handleFlip = () => {
    if (isControlled) {
      if (onFlip) onFlip(!flipped);
    } else {
      setInternalFlipped((f) => {
        if (onFlip) onFlip(!f);
        return !f;
      });
    }
  };

  // Only pass onFlip to FlipCardFront/Back
  const enhancedChildren = React.Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    const typeName = typeof child.type === "function" ? child.type.name : undefined;
    if (typeName === "FlipCardFront" || typeName === "FlipCardBack") {
      // Type assertion: add onFlip prop only to elements that accept it
      return cloneElement(child as ReactElement<FlipCardSideProps>, { onFlip: handleFlip });
    }
    return child;
  });

  return (
    <div
      className={`relative perspective-1000 w-full h-full ${className}`}
      style={{ perspective: 1000 }}
    >
      <div
        className={`transition-transform duration-500 ease-in-out w-full h-full [transform-style:preserve-3d] ${flipped ? "rotate-y-180" : ""}`}
      >
        {enhancedChildren}
      </div>
    </div>
  );
}

interface FlipCardSideProps {
  children: React.ReactNode;
  onFlip?: () => void;
}

export function FlipCardFront({ children }: FlipCardSideProps) {
  return (
    <div className="absolute w-full h-full top-0 left-0 backface-hidden z-10">
      <div className="shadow-2xl bg-white/10 dark:bg-gray-900/60 backdrop-blur-lg flex flex-col w-full h-full">
        {children}
      </div>
    </div>
  );
}

export function FlipCardBack({ children }: FlipCardSideProps) {
  return (
    <div className="absolute w-full h-full top-0 left-0 rotate-y-180 backface-hidden z-20">
      <div className="shadow-2xl bg-white/10 dark:bg-gray-900/60 backdrop-blur-lg flex flex-col w-full h-full">
        {children}
      </div>
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
