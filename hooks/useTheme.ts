/* eslint-disable react-hooks/rules-of-hooks */
import { Colors } from "@/constants/theme";
import { useApp } from "@/contexts/AppContext";

export function useTheme() {
  try {
    const { themeMode } = useApp();
    const isDark = themeMode === "dark";
    const theme = Colors[themeMode];
    return { theme, isDark };
  } catch {
    const theme = Colors.light;
    return { theme, isDark: false };
  }
}
