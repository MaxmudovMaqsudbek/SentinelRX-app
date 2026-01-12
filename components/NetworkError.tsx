/**
 * NetworkError Component
 * 
 * Standardized error state with retry functionality.
 * Follows KISS principle - simple, focused component.
 * 
 * @example
 * <NetworkError 
 *   onRetry={() => refetch()} 
 *   message="Failed to load data" 
 * />
 */
import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useTranslations } from "@/contexts/AppContext";
import { Spacing, BorderRadius } from "@/constants/theme";

interface NetworkErrorProps {
  onRetry?: () => void;
  message?: string;
  title?: string;
  icon?: keyof typeof Feather.glyphMap;
  showRetry?: boolean;
}

export function NetworkError({
  onRetry,
  message,
  title,
  icon = "wifi-off",
  showRetry = true,
}: NetworkErrorProps) {
  const { theme } = useTheme();
  const { t } = useTranslations();

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <View style={[styles.iconContainer, { backgroundColor: theme.error + "15" }]}>
        <Feather name={icon} size={32} color={theme.error} />
      </View>
      
      <ThemedText type="h4" style={styles.title}>
        {title || t.errors.networkError}
      </ThemedText>
      
      <ThemedText 
        type="body" 
        style={[styles.message, { color: theme.textSecondary }]}
      >
        {message || t.errors.somethingWentWrong}
      </ThemedText>

      {showRetry && onRetry && (
        <Button onPress={onRetry} variant="primary" size="medium" style={styles.button}>
          {t.common.retry}
        </Button>
      )}
    </View>
  );
}

// Inline error for smaller spaces
export function InlineError({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  const { theme } = useTheme();
  const { t } = useTranslations();

  return (
    <View style={[styles.inlineContainer, { backgroundColor: theme.error + "10" }]}>
      <Feather name="alert-circle" size={16} color={theme.error} />
      <ThemedText type="small" style={[styles.inlineMessage, { color: theme.error }]}>
        {message || t.errors.networkError}
      </ThemedText>
      {onRetry && (
        <Pressable onPress={onRetry} hitSlop={8}>
          <ThemedText type="small" style={{ color: theme.primary, fontWeight: "600" }}>
            {t.common.retry}
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.lg,
    marginVertical: Spacing.xl,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  message: {
    textAlign: "center",
    marginBottom: Spacing.xl,
    maxWidth: 280,
  },
  button: {
    minWidth: 140,
  },
  inlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  inlineMessage: {
    flex: 1,
  },
});
