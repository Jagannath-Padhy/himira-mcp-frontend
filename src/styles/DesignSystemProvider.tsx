import { useMemo, useState, ReactNode, useEffect } from 'react';
import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { getTheme } from './theme';
import { defaultBrand } from './brands';
import type { ThemeOptions } from '@mui/material/styles';
import { DesignSystemContext } from './DesignSystemContext';

type ThemeMode = 'light' | 'dark';
type Brand = typeof defaultBrand;

const brandsMap: Record<string, Brand> = {
  default: defaultBrand,
};

function loadInitialSettings() {
  try {
    const saved = localStorage.getItem('theme-settings');
    if (saved) {
      return JSON.parse(saved) as {
        mode: ThemeMode;
        brand: string;
        overrides: ThemeOptions;
      };
    }
  } catch {
    // ignore parse errors
  }
  return { mode: 'light' as ThemeMode, brand: 'default', overrides: {} };
}

export function DesignSystemProvider({ children }: { children: ReactNode }) {
  const initial = loadInitialSettings();

  const [mode, setMode] = useState<ThemeMode>(initial.mode);
  const [brand, setBrand] = useState<string>(initial.brand);
  const [overrides, setOverrides] = useState<ThemeOptions>(initial.overrides);

  const theme = useMemo(
    () => getTheme(mode, brandsMap[brand], overrides),
    [mode, brand, overrides],
  );

  const updateTheme = (newOverrides: ThemeOptions) =>
    setOverrides((prev) => ({ ...prev, ...newOverrides }));

  const resetTheme = () => setOverrides({});

  useEffect(() => {
    localStorage.setItem('theme-settings', JSON.stringify({ mode, brand, overrides }));
  }, [mode, brand, overrides]);

  return (
    <DesignSystemContext.Provider
      value={{ mode, brand, setMode, setBrand, updateTheme, resetTheme }}
    >
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </DesignSystemContext.Provider>
  );
}
