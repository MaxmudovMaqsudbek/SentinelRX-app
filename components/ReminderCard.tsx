import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { Reminder } from "@/utils/storage";

interface ReminderCardProps {
  reminder: Reminder;
  onToggle: (id: string) => void;
  onPress?: () => void;
  isTaken: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ReminderCard({
  reminder,
  onToggle,
  onPress,
  isTaken,
}: ReminderCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleCardPress = () => {
    onToggle(reminder.id);
  };

  return (
    <AnimatedPressable
      onPress={handleCardPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isTaken }}
      accessibilityLabel={`${reminder.medicationName} ${reminder.dosage} at ${formatTime(reminder.time)}, ${isTaken ? "taken" : "not taken"}`}
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBackground,
          opacity: isTaken ? 0.7 : 1,
        },
        Shadows.small,
        animatedStyle,
      ]}
    >
      <View
        style={[
          styles.checkbox,
          {
            backgroundColor: isTaken ? theme.success : "transparent",
            borderColor: isTaken ? theme.success : theme.border,
          },
        ]}
      >
        {isTaken ? <Feather name="check" size={16} color="#FFFFFF" /> : null}
      </View>

      <View style={styles.content}>
        <ThemedText
          type="h4"
          style={[styles.name, isTaken && styles.takenText]}
          numberOfLines={1}
        >
          {reminder.medicationName}
        </ThemedText>
        <ThemedText
          type="small"
          style={[styles.dosage, { color: theme.textSecondary }]}
        >
          {reminder.dosage}
        </ThemedText>
      </View>

      <View style={styles.timeContainer}>
        <ThemedText type="label" style={{ color: theme.primary }}>
          {formatTime(reminder.time)}
        </ThemedText>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  name: {},
  takenText: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  dosage: {
    marginTop: Spacing.xs,
  },
  timeContainer: {
    marginLeft: Spacing.md,
  },
});
