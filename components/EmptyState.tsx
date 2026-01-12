import React, { useEffect } from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming,
  FadeInUp 
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

interface EmptyStateProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { theme, isDark } = useTheme();

  // Subtle floating animation for icon
  const float = useSharedValue(0);
  
  useEffect(() => {
    float.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: float.value }],
  }));

  return (
    <Animated.View 
      entering={FadeInUp.delay(100).springify()} 
      style={styles.container}
    >
      {/* Premium Gradient Icon Container */}
      <Animated.View style={[styles.iconWrapper, animatedIconStyle]}>
        <LinearGradient
          colors={isDark 
            ? ['#1E3A5F', '#0F2744'] 
            : ['#E0F2FE', '#BAE6FD']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconGradient}
        >
          {/* Inner glow effect */}
          <View style={[styles.iconInner, { backgroundColor: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.1)' }]}>
            <Feather name={icon} size={40} color={theme.primary} />
          </View>
        </LinearGradient>
        
        {/* Decorative rings */}
        <View style={[styles.decorRing, styles.ringOuter, { borderColor: theme.primary + '15' }]} />
        <View style={[styles.decorRing, styles.ringInner, { borderColor: theme.primary + '20' }]} />
      </Animated.View>

      {/* Title */}
      <ThemedText type="h3" style={styles.title}>
        {title}
      </ThemedText>

      {/* Description */}
      <ThemedText
        type="body"
        style={[styles.description, { color: theme.textSecondary }]}
      >
        {description}
      </ThemedText>

      {/* Premium Action Button */}
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
          <LinearGradient
            colors={[theme.primary, isDark ? '#1E40AF' : '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.actionButton}
          >
            <ThemedText type="body" style={styles.actionText}>
              {actionLabel}
            </ThemedText>
            <Feather name="arrow-right" size={18} color="#FFF" />
          </LinearGradient>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["2xl"],
    paddingVertical: Spacing["3xl"],
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: Spacing["2xl"],
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.medium,
  },
  iconInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  decorRing: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1.5,
  },
  ringOuter: {
    width: 130,
    height: 130,
    top: -15,
    left: -15,
  },
  ringInner: {
    width: 150,
    height: 150,
    top: -25,
    left: -25,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
    fontWeight: '700',
  },
  description: {
    textAlign: "center",
    marginBottom: Spacing["2xl"],
    lineHeight: 22,
    paddingHorizontal: Spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: BorderRadius.xl,
    gap: 8,
    ...Shadows.small,
  },
  actionText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 15,
  },
});
