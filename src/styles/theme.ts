// src/styles/theme.ts
import { createTheme, ThemeOptions } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';
import { defaultBrand } from './brands';

export const getTheme = (
  mode: 'light' | 'dark' = 'light',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  brand: any = defaultBrand,
  overrides: ThemeOptions = {},
) => {
  const base = brand[mode];
  const merged = deepmerge(base, overrides);

  return createTheme({
    ...merged,
    palette: {
      ...merged.palette,
      text: {
        primary: mode === 'light' ? '#1A1A1A' : '#F3F3F3',
        secondary: mode === 'light' ? '#555' : '#AAA',
      },
      divider: mode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)',
    },
    typography: {
      ...merged.typography,
      h1: { fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.5px' },
      h2: { fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.25px' },
      body1: { fontSize: '1rem', lineHeight: 1.65 },
      body2: { fontSize: '0.9rem', lineHeight: 1.55 },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            fontWeight: 600,
            padding: '8px 20px',
            transition: 'all 0.2s ease-in-out',
          },
          contained: {
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          },
        },
        defaultProps: {
          disableElevation: true,
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundImage: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            '&.Mui-selected': {
              backgroundColor: 'rgba(0,0,0,0.08)',
            },
          },
        },
      },
    },
  });
};
