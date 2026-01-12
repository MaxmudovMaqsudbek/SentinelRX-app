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
import {
  Spacing,
  BorderRadius,
  Shadows,
  MedicalColors,
} from "@/constants/theme";
import { PriceInfo } from "@/utils/aiServices";

interface PharmacyCardProps {
  pharmacy: PriceInfo;
  onPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PharmacyCard({ pharmacy, onPress }: PharmacyCardProps) {
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

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBackground,
          borderColor: pharmacy.isSuspicious
            ? MedicalColors.suspicious
            : "transparent",
          borderWidth: pharmacy.isSuspicious ? 2 : 0,
        },
        Shadows.small,
        animatedStyle,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.nameRow}>
          <ThemedText type="h4" style={styles.name} numberOfLines={1}>
            {pharmacy.pharmacyName}
          </ThemedText>
          {pharmacy.isVerified ? (
            <View
              style={[
                styles.verifiedBadge,
                { backgroundColor: MedicalColors.verified },
              ]}
            >
              <Feather name="check" size={12} color="#FFFFFF" />
            </View>
          ) : null}
        </View>
        <View style={styles.distanceRow}>
          <Feather name="map-pin" size={14} color={theme.textSecondary} />
          <ThemedText
            type="small"
            style={[styles.distance, { color: theme.textSecondary }]}
          >
            {pharmacy.distance}
          </ThemedText>
        </View>
      </View>

      <View style={styles.priceContainer}>
        <ThemedText
          type="h3"
          style={[
            styles.price,
            {
              color: pharmacy.isSuspicious
                ? MedicalColors.suspicious
                : theme.primary,
            },
          ]}
        >
          ${pharmacy.price.toFixed(2)}
        </ThemedText>
        {pharmacy.isSuspicious ? (
          <View
            style={[
              styles.warningBadge,
              { backgroundColor: MedicalColors.severityMajor.background },
            ]}
          >
            <Feather
              name="alert-triangle"
              size={12}
              color={MedicalColors.suspicious}
            />
            <ThemedText
              type="caption"
              style={{ color: MedicalColors.suspicious, marginLeft: 4 }}
            >
              Suspicious
            </ThemedText>
          </View>
        ) : null}
      </View>

      {pharmacy.isSuspicious && pharmacy.suspicionReason ? (
        <View
          style={[
            styles.warningBox,
            { backgroundColor: MedicalColors.severityMajor.background },
          ]}
        >
          <ThemedText
            type="small"
            style={{ color: MedicalColors.severityMajor.text }}
          >
            {pharmacy.suspicionReason}
          </ThemedText>
        </View>
      ) : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  header: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    flex: 1,
  },
  verifiedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.sm,
  },
  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  distance: {
    marginLeft: Spacing.xs,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.md,
  },
  price: {
    flex: 1,
  },
  warningBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  warningBox: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
});
