"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { shockingPalette } from './utils/palette';

interface ThemeContextType {
    primary: string;
    setPrimary: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [primary, setPrimary] = useState<string>(shockingPalette[0]);

    return (
        <ThemeContext.Provider value={{ primary, setPrimary }}>
            <div style={{ '--color-primary': primary } as React.CSSProperties}>
                {children}
            </div>
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}
