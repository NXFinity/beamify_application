import React from "react";

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className = "", children }: CardProps) {
  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

interface CardSectionProps {
  className?: string;
  children: React.ReactNode;
}

export function CardHeader({ className = "", children }: CardSectionProps) {
  return (
    <div className={`px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 font-semibold text-lg ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ className = "", children }: CardSectionProps) {
  return (
    <div className={`px-6 py-4 ${className}`}>{children}</div>
  );
}

export function CardFooter({ className = "", children }: CardSectionProps) {
  return (
    <div className={`px-6 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 ${className}`}>{children}</div>
  );
}

export function CardActions({ className = "", children }: CardSectionProps) {
  return (
    <div className={`flex gap-2 px-6 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 justify-end ${className}`}>{children}</div>
  );
}
