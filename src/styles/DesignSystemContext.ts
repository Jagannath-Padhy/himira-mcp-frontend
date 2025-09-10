import { createContext } from 'react';
import type { ThemeOptions } from '@mui/material/styles';

type ThemeMode = 'light' | 'dark';

export type DesignSystemContextProps = {
  mode: ThemeMode;
  brand: string;
  setMode: (mode: ThemeMode) => void;
  setBrand: (brand: string) => void;
  updateTheme: (overrides: ThemeOptions) => void;
  resetTheme: () => void;
};

export const DesignSystemContext = createContext<DesignSystemContextProps | undefined>(undefined);
