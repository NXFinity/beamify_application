"use client";
import React from 'react';
import { useTheme } from '../ThemeProvider';
import tinycolor from "tinycolor2";

export const shockingPalette = [
  '#ff3c00', // primary
  '#00e0ff',
  '#ff00c8',
  '#ffe600',
  '#00ff85',
  '#8c00ff',
];

export const shockingGradients = shockingPalette.map(color => {
  // Less dark: darken by 20 instead of 40
  const dark = tinycolor(color).darken(20).toHexString();
  return `linear-gradient(90deg, ${dark} 0%, ${color} 100%)`;
});

export const shockingAnalogousGradients = Array(6).fill('linear-gradient(120deg, #00112a 0%, #002147 100%)');

export const shockingDarkToLightGradients = shockingPalette.map(color => {
  const dark = tinycolor(color).darken(25).toHexString();
  const light = tinycolor(color).lighten(25).toHexString();
  return `linear-gradient(90deg, ${dark} 0%, ${light} 100%)`;
});

export const shockingOppositeGradients = [
  // Orange
  'linear-gradient(90deg, #00112a 0%, #002147 100%)',
  // Cyan
  'linear-gradient(90deg, #2a0033 0%, #4b005c 100%)',
  // Magenta
  'linear-gradient(90deg, #002a1a 0%, #004b36 100%)',
  // Yellow
  'linear-gradient(90deg, #1a002a 0%, #2d004b 100%)',
  // Green
  'linear-gradient(90deg, #2a0020 0%, #4b0036 100%)',
  // Purple
  'linear-gradient(90deg, #2a1a00 0%, #4b3600 100%)',
];

export function ColorPalette() {
  const { primary, setPrimary } = useTheme();

  return (
    <div>
      <div className="font-semibold text-gray-700 mb-1">Color Palette</div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {shockingPalette.map((color) => {
          const isActive = primary === color;
          return (
            <button
              key={color}
              aria-label={`Select color ${color}`}
              onClick={() => setPrimary(color)}
              className={`h-10 rounded-md border-2 flex items-center justify-center transition
                ${isActive ? "border-black ring-2 ring-black" : "border-gray-200 hover:border-black"}
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black`}
              style={{ background: color }}
            >
              {isActive && (
                <svg
                  className="w-5 h-5 text-white drop-shadow"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
      <div className="font-semibold text-gray-700 mb-1 mt-2">Gradient Palette</div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {shockingGradients.map((gradient, i) => {
          const color = shockingPalette[i];
          const isActive = primary === color;
          return (
            <button
              key={gradient}
              aria-label={`Select gradient for ${color}`}
              onClick={() => setPrimary(color)}
              className={`h-10 rounded-md border-2 flex items-center justify-center transition
                ${isActive ? "border-black ring-2 ring-black" : "border-gray-200 hover:border-black"}
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black`}
              style={{ background: gradient }}
            >
              {isActive && (
                <svg
                  className="w-5 h-5 text-white drop-shadow"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
