import React from "react";
import { View, StyleSheet, Linking, Platform } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { Button } from "@/components/Button";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import {
  Spacing,
  BorderRadius,
  Shadows,
  MedicalColors,
} from "@/constants/theme";
import { PharmacyStackParamList } from "@/navigation/PharmacyStackNavigator";

type PharmacyDetailScreenProps = {
  navigation: NativeStackNavigationProp<
    PharmacyStackParamList,
    "PharmacyDetail"
  >;
  route: RouteProp<PharmacyStackParamList, "PharmacyDetail">;
};

export default function PharmacyDetailScreen({
  navigation,
  route,
}: PharmacyDetailScreenProps) {
  const { theme } = useTheme();
  const { pharmacyId } = route.params;

  const pharmacyData = {
    id: pharmacyId,
    name: "HealthPlus Pharmacy",
    address: "123 Main Street, City Center",
    phone: "+1 234 567 8900",
    hours: "Mon-Fri: 8AM-9PM, Sat-Sun: 9AM-6PM",
    isVerified: true,
    is24Hours: false,
    rating: 4.8,
    reviewCount: 124,
    distance: "0.3 km",
    walkingTime: "4 min",
    latitude: 41.3111,
    longitude: 69.2797,
  };

  const inventoryItems = [
    { name: "Acetaminophen 500mg", inStock: true, price: 12.99 },
    { name: "Ibuprofen 200mg", inStock: true, price: 9.99 },
    { name: "Amoxicillin 500mg", inStock: false, price: 24.99 },
    { name: "Lisinopril 10mg", inStock: true, price: 18.99 },
  ];

  const handleCall = () => {
    Linking.openURL(`tel:${pharmacyData.phone}`);
  };

  const handleDirections = () => {
    const url = Platform.select({
      ios: `maps://app?daddr=${pharmacyData.latitude},${pharmacyData.longitude}`,
      android: `google.navigation:q=${pharmacyData.latitude},${pharmacyData.longitude}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${pharmacyData.latitude},${pharmacyData.longitude}`,
    });

    Linking.openURL(url).catch(() => {
      Linking.openURL(
        `https://www.google.com/maps/dir/?api=1&destination=${pharmacyData.latitude},${pharmacyData.longitude}`,
      );
    });
  };

  return (
    <ScreenScrollView>
      <View
        style={[
          styles.headerCard,
          { backgroundColor: theme.cardBackground },
          Shadows.medium,
        ]}
      >
        <View style={styles.headerTop}>
          <View
            style={[
              styles.pharmacyIcon,
              { backgroundColor: theme.primary + "20" },
            ]}
          >
            <Feather name="map-pin" size={32} color={theme.primary} />
          </View>
          {pharmacyData.isVerified ? (
            <View
              style={[
                styles.verifiedBadge,
                { backgroundColor: MedicalColors.verified },
              ]}
            >
              <Feather name="check" size={14} color="#FFFFFF" />
              <ThemedText type="caption" style={styles.verifiedText}>
                Verified
              </ThemedText>
            </View>
          ) : null}
        </View>

        <ThemedText type="h2" style={styles.pharmacyName}>
          {pharmacyData.name}
        </ThemedText>

        <View style={styles.ratingRow}>
          <Feather name="star" size={16} color={theme.accent} />
          <ThemedText type="label" style={styles.rating}>
            {pharmacyData.rating}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            ({pharmacyData.reviewCount} reviews)
          </ThemedText>
        </View>

        <Spacer height={Spacing.lg} />

        <View style={styles.quickStats}>
          <View style={styles.quickStat}>
            <Feather name="map-pin" size={20} color={theme.textSecondary} />
            <ThemedText type="body">{pharmacyData.distance}</ThemedText>
          </View>
          <View style={styles.quickStat}>
            <Feather name="clock" size={20} color={theme.textSecondary} />
            <ThemedText type="body">{pharmacyData.walkingTime}</ThemedText>
          </View>
          {pharmacyData.is24Hours ? (
            <View
              style={[styles.badge24, { backgroundColor: theme.secondary }]}
            >
              <ThemedText
                type="caption"
                style={{ color: "#FFFFFF", fontWeight: "600" }}
              >
                24/7
              </ThemedText>
            </View>
          ) : null}
        </View>
      </View>

      <Spacer height={Spacing.lg} />

      <View style={styles.actionButtons}>
        <Button onPress={handleDirections} style={styles.actionButton}>
          <Feather name="navigation" size={18} color="#FFFFFF" />
          <ThemedText type="label" style={styles.actionButtonText}>
            Directions
          </ThemedText>
        </Button>
        <Button
          onPress={handleCall}
          style={[styles.actionButton, { backgroundColor: theme.secondary }]}
        >
          <Feather name="phone" size={18} color="#FFFFFF" />
          <ThemedText type="label" style={styles.actionButtonText}>
            Call
          </ThemedText>
        </Button>
      </View>

      <Spacer height={Spacing.xl} />

      <ThemedText type="h3">Contact Information</ThemedText>
      <Spacer height={Spacing.md} />

      <View
        style={[
          styles.infoCard,
          { backgroundColor: theme.cardBackground },
          Shadows.small,
        ]}
      >
        <View style={styles.infoRow}>
          <Feather name="map-pin" size={20} color={theme.textSecondary} />
          <ThemedText type="body" style={styles.infoText}>
            {pharmacyData.address}
          </ThemedText>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <View style={styles.infoRow}>
          <Feather name="phone" size={20} color={theme.textSecondary} />
          <ThemedText type="body" style={styles.infoText}>
            {pharmacyData.phone}
          </ThemedText>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <View style={styles.infoRow}>
          <Feather name="clock" size={20} color={theme.textSecondary} />
          <ThemedText type="body" style={styles.infoText}>
            {pharmacyData.hours}
          </ThemedText>
        </View>
      </View>

      <Spacer height={Spacing.xl} />

      <ThemedText type="h3">Medication Inventory</ThemedText>
      <Spacer height={Spacing.md} />

      <View
        style={[
          styles.inventoryCard,
          { backgroundColor: theme.cardBackground },
          Shadows.small,
        ]}
      >
        {inventoryItems.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 ? (
              <View
                style={[styles.divider, { backgroundColor: theme.border }]}
              />
            ) : null}
            <View style={styles.inventoryRow}>
              <View style={styles.inventoryInfo}>
                <ThemedText type="body">{item.name}</ThemedText>
                <View
                  style={[
                    styles.stockBadge,
                    {
                      backgroundColor: item.inStock
                        ? MedicalColors.safe + "20"
                        : theme.backgroundSecondary,
                    },
                  ]}
                >
                  <ThemedText
                    type="caption"
                    style={{
                      color: item.inStock
                        ? MedicalColors.safe
                        : theme.textSecondary,
                    }}
                  >
                    {item.inStock ? "In Stock" : "Out of Stock"}
                  </ThemedText>
                </View>
              </View>
              <ThemedText type="h4" style={{ color: theme.primary }}>
                ${item.price.toFixed(2)}
              </ThemedText>
            </View>
          </React.Fragment>
        ))}
      </View>

      <Spacer height={Spacing["3xl"]} />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  pharmacyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  verifiedText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  pharmacyName: {
    marginBottom: Spacing.sm,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  rating: {
    marginLeft: Spacing.xs,
  },
  quickStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xl,
  },
  quickStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  badge24: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  actionButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  actionButtonText: {
    color: "#FFFFFF",
  },
  infoCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  infoText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  divider: {
    height: 1,
  },
  inventoryCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  inventoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
  },
  inventoryInfo: {
    flex: 1,
    gap: Spacing.sm,
  },
  stockBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
});
