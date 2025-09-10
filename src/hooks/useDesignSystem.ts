import { DesignSystemContext } from '@styles';
import { useContext } from 'react';

export const useDesignSystem = () => {
  const ctx = useContext(DesignSystemContext);
  if (!ctx) throw new Error('useDesignSystem must be used within DesignSystemProvider');
  return ctx;
};
