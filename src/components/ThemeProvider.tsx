import React from 'react';
import { AnimatePresence } from 'framer-motion';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <AnimatePresence mode="wait">
      {children}
    </AnimatePresence>
  );
}