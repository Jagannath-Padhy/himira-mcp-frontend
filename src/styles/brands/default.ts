// src/styles/brands/defaultBrand.ts
import { lightColors, darkColors, typography, shape } from '../tokens';

export const defaultBrand = {
  light: {
    palette: {
      mode: 'light',
      primary: lightColors.primary,
      secondary: lightColors.secondary,
      error: lightColors.error,
      warning: lightColors.warning,
      info: lightColors.info,
      success: lightColors.success,
      background: lightColors.background,
      text: lightColors.text,
      divider: lightColors.divider,
      grey: lightColors.grey,
    },
    typography,
    shape,
  },
  dark: {
    palette: {
      mode: 'dark',
      primary: darkColors.primary,
      secondary: darkColors.secondary,
      error: darkColors.error,
      warning: darkColors.warning,
      info: darkColors.info,
      success: darkColors.success,
      background: darkColors.background,
      text: darkColors.text,
      divider: darkColors.divider,
      grey: darkColors.grey,
    },
    typography,
    shape,
  },
};
