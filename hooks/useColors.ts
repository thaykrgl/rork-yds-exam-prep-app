import { useMemo } from 'react';
import { useThemeStore } from '@/stores/themeStore';
import { getColors } from '@/constants/colors';

export function useColors() {
  const mode = useThemeStore((s) => s.mode);
  return useMemo(() => getColors(mode), [mode]);
}
