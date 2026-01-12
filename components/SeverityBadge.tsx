import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { MedicalColors, Spacing, BorderRadius } from "@/constants/theme";

interface SeverityBadgeProps {
  severity: string;
  size?: "small" | "large";
}

export function SeverityBadge({
  severity,
  size = "small",
}: SeverityBadgeProps) {
  const getColors = () => {
    if (!severity) return MedicalColors.severityMinor;
    const s = severity.toLowerCase();
    
    if (s.includes("high") || s.includes("major") || s.includes("critical")) {
        return MedicalColors.severityMajor;
    }
    if (s.includes("moderate") || s.includes("medium")) {
        return MedicalColors.severityModerate;
    }
    return MedicalColors.severityMinor;
  };

  const colors = getColors() || MedicalColors.severityMinor;
  const label = severity ? (severity.charAt(0).toUpperCase() + severity.slice(1)) : "Unknown";

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colors.background },
        size === "large" && styles.badgeLarge,
      ]}
    >
      <ThemedText
        type={size === "large" ? "label" : "caption"}
        style={[styles.text, { color: colors.text }]}
      >
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    alignSelf: "flex-start",
  },
  badgeLarge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  text: {
    fontWeight: "600",
  },
});
