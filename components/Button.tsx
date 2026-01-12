import React, { ReactNode } from "react";
import { StyleSheet, Pressable, ViewStyle, StyleProp, ActivityIndicator, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Shadows } from "@/constants/theme";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "small" | "medium" | "large";

export interface ButtonProps {
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: keyof typeof Feather.glyphMap;
  rightIcon?: keyof typeof Feather.glyphMap;
  loading?: boolean;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  onPress,
  children,
  style,
  disabled = false,
  variant = "primary",
  size = "medium",
  leftIcon,
  rightIcon,
  loading = false,
}: ButtonProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.97, springConfig);
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withSpring(1, springConfig);
    }
  };

  const getBackgroundColor = (): string => {
    if (disabled) {
      return theme.textSecondary;
    }
    switch (variant) {
      case "primary":
        return theme.primary;
      case "secondary":
        return theme.backgroundSecondary;
      case "outline":
      case "ghost":
        return "transparent";
      default:
        return theme.primary;
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case "primary":
        return theme.buttonText;
      case "secondary":
        return theme.text;
      case "outline":
      case "ghost":
        return theme.primary;
      default:
        return theme.buttonText;
    }
  };

  const getBorderStyle = (): ViewStyle => {
    if (variant === "outline") {
      return {
        borderWidth: 1.5,
        borderColor: theme.primary,
      };
    }
    return {};
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case "small":
        return {
          height: 40,
          paddingHorizontal: Spacing.lg,
        };
      case "large":
        return {
          height: 56,
          paddingHorizontal: Spacing["2xl"],
        };
      case "medium":
      default:
        return {
          height: Spacing.buttonHeight,
          paddingHorizontal: Spacing.xl,
        };
    }
  };

  const getShadowStyle = () => {
    if (variant === "primary" && !disabled) {
      return Shadows.medium;
    }
    return {};
  };

  return (
    <AnimatedPressable
      onPress={disabled || loading ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.button,
        getSizeStyle(),
        getBorderStyle(),
        getShadowStyle(),
        {
          backgroundColor: getBackgroundColor(),
          opacity: disabled ? 0.5 : 1,
        },
        style,
        animatedStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === "primary" ? theme.buttonText : theme.primary} 
        />
      ) : (
        <View style={styles.content}>
          {leftIcon && (
            <Feather 
              name={leftIcon} 
              size={size === "small" ? 16 : 18} 
              color={getTextColor()} 
              style={styles.leftIcon}
            />
          )}
          <ThemedText
            type="body"
            style={[styles.buttonText, { color: getTextColor() }]}
          >
            {children}
          </ThemedText>
          {rightIcon && (
            <Feather 
              name={rightIcon} 
              size={size === "small" ? 16 : 18} 
              color={getTextColor()} 
              style={styles.rightIcon}
            />
          )}
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});
