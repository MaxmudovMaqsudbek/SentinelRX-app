import React from "react";
import { StyleSheet, Pressable, View, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

interface MedCardProps {
  title: string;
  subtitle?: string;
  leftIcon?: keyof typeof Feather.glyphMap;
  rightIcon?: keyof typeof Feather.glyphMap;
  onPress?: () => void;
  children?: React.ReactNode;
  style?: ViewStyle;
  badge?: string;
  badgeColor?: string;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function MedCard({
  title,
  subtitle,
  leftIcon,
  rightIcon = "chevron-right",
  onPress,
  children,
  style,
  badge,
  badgeColor,
}: MedCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98, springConfig);
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, springConfig);
    }
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBackground,
        },
        Shadows.medium,
        style,
        animatedStyle,
      ]}
    >
      <View style={styles.header}>
        {leftIcon ? (
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <Feather name={leftIcon} size={20} color={theme.primary} />
          </View>
        ) : null}
        <View style={styles.titleContainer}>
          <View style={styles.titleRow}>
            <ThemedText type="h4" style={styles.title} numberOfLines={1}>
              {title}
            </ThemedText>
            {badge ? (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: badgeColor || theme.primary },
                ]}
              >
                <ThemedText type="caption" style={styles.badgeText}>
                  {badge}
                </ThemedText>
              </View>
            ) : null}
          </View>
          {subtitle ? (
            <ThemedText
              type="small"
              style={[styles.subtitle, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              {subtitle}
            </ThemedText>
          ) : null}
        </View>
        {onPress && rightIcon ? (
          <Feather name={rightIcon} size={20} color={theme.textSecondary} />
        ) : null}
      </View>
      {children ? <View style={styles.content}>{children}</View> : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    flex: 1,
  },
  subtitle: {
    marginTop: Spacing.xs,
  },
  content: {
    marginTop: Spacing.md,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    marginLeft: Spacing.sm,
  },
  badgeText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
