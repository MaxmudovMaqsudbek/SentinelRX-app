/* eslint-disable prettier/prettier */
import { Platform } from "react-native";

/**
 * SentinelRX Design System
 * 
 * Primary: Deep Ocean Blue (#004575) - Trust, calm, medical professionalism
 * Design Philosophy: Minimalist, liquid/fluid aesthetics, calming experience
 */

export const Colors = {
  light: {
    // Typography
    text: "#1A2B3C",
    textSecondary: "#5A6B7C",
    buttonText: "#FFFFFF",

    // Navigation
    tabIconDefault: "#8A9BAC",
    tabIconSelected: "#004575",
    link: "#004575",

    // Brand Colors
    primary: "#004575",        // Deep Ocean Blue - Main brand color
    primaryLight: "#0066A8",
    primaryDark: "#003354",
    secondary: "#00A5B5",      // Teal accent - Fresh, modern
    accent: "#FF7B54",         // Warm coral - Attention

    // Semantic Colors
    error: "#E53935",
    success: "#00C853",
    warning: "#FFB300",
    info: "#2196F3",

    // Backgrounds
    backgroundRoot: "#F8FAFC",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#F1F5F9",
    backgroundTertiary: "#E8EEF4",

    // Surface & Borders
    border: "#E2E8F0",
    cardBackground: "#FFFFFF",
    glassMorphism: "rgba(255, 255, 255, 0.72)",

    // Scanner
    scannerOverlay: "rgba(0, 69, 117, 0.85)",
    scannerFrame: "#00A5B5",
  },
  dark: {
    // Typography
    text: "#F1F5F9",
    textSecondary: "#94A3B8",
    buttonText: "#FFFFFF",

    // Navigation
    tabIconDefault: "#64748B",
    tabIconSelected: "#38BDF8",
    link: "#38BDF8",

    // Brand Colors
    primary: "#38BDF8",
    primaryLight: "#7DD3FC",
    primaryDark: "#0284C7",
    secondary: "#2DD4BF",
    accent: "#FB923C",

    // Semantic Colors
    error: "#F87171",
    success: "#4ADE80",
    warning: "#FBBF24",
    info: "#60A5FA",

    // Backgrounds
    backgroundRoot: "#0F172A",
    backgroundDefault: "#1E293B",
    backgroundSecondary: "#273449",
    backgroundTertiary: "#334155",

    // Surface & Borders
    border: "#334155",
    cardBackground: "#1E293B",
    glassMorphism: "rgba(30, 41, 59, 0.8)",

    // Scanner
    scannerOverlay: "rgba(15, 23, 42, 0.9)",
    scannerFrame: "#2DD4BF",
  },
};

// Gradient definitions for liquid/fluid design
export const Gradients = {
  primary: ["#004575", "#0066A8", "#00A5B5"],
  primarySoft: ["rgba(0, 69, 117, 0.08)", "rgba(0, 165, 181, 0.04)"],
  oceanWave: ["#004575", "#006B8F", "#00A5B5"],
  calm: ["#E8EEF4", "#F1F5F9", "#F8FAFC"],
};

export const MedicalColors = {
  severityMinor: {
    background: "#FEF3C7",
    text: "#B45309",
    border: "#FCD34D",
  },
  severityModerate: {
    background: "#FFEDD5",
    text: "#C2410C",
    border: "#FB923C",
  },
  severityMajor: {
    background: "#FEE2E2",
    text: "#B91C1C",
    border: "#F87171",
  },
  verified: "#10B981",
  unverified: "#94A3B8",
  suspicious: "#EF4444",
  safe: "#10B981",
  // Semantic colors for interaction severity
  interactionSafe: {
    background: "#DCFCE7",
    text: "#166534",
    border: "#86EFAC",
  },
  interactionWarning: {
    background: "#FEF3C7",
    text: "#92400E",
    border: "#FCD34D",
  },
  interactionDanger: {
    background: "#FEE2E2",
    text: "#991B1B",
    border: "#FECACA",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 28,
  "3xl": 32,
  full: 9999,
  blob: 30,
  pill: 50,
};

export const Typography = {
  display: {
    fontSize: 32,
    fontWeight: "700" as const,
  },
  h1: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 24,
    fontWeight: "600" as const,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 18,
    fontWeight: "400" as const,
  },
  bodyLarge: {
    fontSize: 18,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
  },
  label: {
    fontSize: 16,
    fontWeight: "500" as const,
  },
  link: {
    fontSize: 16,
    fontWeight: "500" as const,
  },
};

export const Shadows = {
  small: {
    shadowColor: "#004575",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: "#004575",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: "#004575",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: "#004575",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Inter', sans-serif",
    mono: "'JetBrains Mono', 'SF Mono', Consolas, monospace",
  },
});

// Reusable Card Styles for consistent elevation/styling
export const CardStyles = {
  default: {
    borderRadius: 20,
    padding: 16,
  },
  elevated: {
    borderRadius: 20,
    padding: 16,
    ...Shadows.medium,
  },
  subtle: {
    borderRadius: 16,
    padding: 12,
    ...Shadows.small,
  },
};

// Touch target constants for accessibility
export const TouchTargets = {
  minimum: 44, // iOS HIG minimum
  recommended: 48, // Material Design recommended
};
