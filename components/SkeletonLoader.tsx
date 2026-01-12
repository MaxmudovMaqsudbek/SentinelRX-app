/**
 * SkeletonLoader Component
 * 
 * A reusable loading placeholder with shimmer animation.
 * Follows DRY principle - one component for all skeleton needs.
 * 
 * @example
 * <SkeletonLoader width={200} height={20} variant="text" />
 * <SkeletonLoader width="100%" height={120} variant="card" />
 */
import React, { useEffect } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius } from "@/constants/theme";

type SkeletonVariant = "text" | "card" | "avatar" | "button" | "custom";

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  variant?: SkeletonVariant;
  style?: ViewStyle;
}

export function SkeletonLoader({
  width = "100%",
  height = 20,
  borderRadius,
  variant = "text",
  style,
}: SkeletonLoaderProps) {
  const { theme, isDark } = useTheme();
  const shimmerProgress = useSharedValue(0);

  useEffect(() => {
    shimmerProgress.value = withRepeat(
      withTiming(1, { duration: 1200 }),
      -1, // infinite
      false // no reverse
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerProgress.value,
      [0, 1],
      [-200, 200]
    );
    return {
      transform: [{ translateX }],
    };
  });

  const getVariantStyles = (): { height: number; borderRadius: number } => {
    switch (variant) {
      case "avatar":
        return { height: height || 48, borderRadius: (height || 48) / 2 };
      case "card":
        return { height: height || 120, borderRadius: BorderRadius.lg };
      case "button":
        return { height: height || 48, borderRadius: BorderRadius.md };
      case "text":
      default:
        return { height: height || 20, borderRadius: BorderRadius.xs };
    }
  };

  const variantStyles = getVariantStyles();
  const finalBorderRadius = borderRadius ?? variantStyles.borderRadius;
  const finalHeight = height ?? variantStyles.height;

  const baseColor = isDark ? theme.backgroundSecondary : theme.border;
  const shimmerColor = isDark 
    ? "rgba(255, 255, 255, 0.1)" 
    : "rgba(255, 255, 255, 0.8)";

  return (
    <View
      style={[
        styles.container,
        {
          width: width as any,
          height: finalHeight,
          borderRadius: finalBorderRadius,
          backgroundColor: baseColor,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            backgroundColor: shimmerColor,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

// Preset skeleton layouts for common patterns
export function SkeletonCard() {
  return (
    <View style={styles.cardContainer}>
      <SkeletonLoader variant="card" height={120} />
      <View style={styles.cardContent}>
        <SkeletonLoader variant="text" width="70%" height={18} />
        <SkeletonLoader variant="text" width="50%" height={14} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

export function SkeletonListItem() {
  return (
    <View style={styles.listItem}>
      <SkeletonLoader variant="avatar" width={48} height={48} />
      <View style={styles.listItemContent}>
        <SkeletonLoader variant="text" width="60%" height={16} />
        <SkeletonLoader variant="text" width="40%" height={12} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  shimmer: {
    width: 100,
    height: "100%",
    position: "absolute",
  },
  cardContainer: {
    marginBottom: 16,
  },
  cardContent: {
    marginTop: 12,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
});
