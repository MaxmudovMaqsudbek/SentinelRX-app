import React, { useState } from "react";
import { View, StyleSheet, Pressable, Linking } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, MedicalColors } from "@/constants/theme";

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface PharmacyMarker {
  id: string;
  name: string;
  address: string;
  distance: string;
  latitude: number;
  longitude: number;
  isVerified: boolean;
}

interface MapViewContainerProps {
  region: Region;
  onRegionChange: (region: Region) => void;
  pharmacies: PharmacyMarker[];
  userLocation: { latitude: number; longitude: number } | null;
  locationPermission: boolean;
}

export function MapViewContainer({ pharmacies, userLocation, region }: MapViewContainerProps) {
  const { theme } = useTheme();
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyMarker | null>(null);

  const openInGoogleMaps = (pharmacy: PharmacyMarker) => {
    if (pharmacy.latitude === 0) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${pharmacy.latitude},${pharmacy.longitude}`;
    Linking.openURL(url);
  };

  const openAllInMaps = () => {
    const url = `https://www.google.com/maps/search/pharmacy/@${region.latitude},${region.longitude},14z`;
    Linking.openURL(url);
  };

  return (
    <View
      style={[
        styles.mapPlaceholder,
        { backgroundColor: theme.backgroundSecondary },
      ]}
    >
      {/* Location Status Banner */}
      <View style={[styles.locationBanner, { backgroundColor: theme.primary + '15' }]}>
        <View style={styles.locationInfo}>
          <Feather 
            name={userLocation ? "check-circle" : "map-pin"} 
            size={16} 
            color={userLocation ? theme.success : theme.primary} 
          />
          <ThemedText type="small" style={{ marginLeft: Spacing.sm, color: theme.text }}>
            {userLocation 
              ? `Location: ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`
              : "Using default location (Tashkent, Uzbekistan)"
            }
          </ThemedText>
        </View>
        <Pressable onPress={openAllInMaps} style={styles.openMapsLink}>
          <ThemedText type="small" style={{ color: theme.primary }}>
            Open in Maps
          </ThemedText>
          <Feather name="external-link" size={12} color={theme.primary} style={{ marginLeft: 4 }} />
        </Pressable>
      </View>

      {/* Interactive Pharmacy Cards on Map */}
      <View style={styles.mapContent}>
        <View style={styles.pharmacyGrid}>
          {pharmacies
            .filter((p) => p.latitude !== 0)
            .slice(0, 4)
            .map((pharmacy) => (
              <Pressable
                key={pharmacy.id}
                onPress={() => setSelectedPharmacy(selectedPharmacy?.id === pharmacy.id ? null : pharmacy)}
                style={[
                  styles.pharmacyMapCard,
                  { 
                    backgroundColor: theme.cardBackground,
                    borderColor: selectedPharmacy?.id === pharmacy.id ? theme.primary : 'transparent',
                    borderWidth: selectedPharmacy?.id === pharmacy.id ? 2 : 0,
                  },
                ]}
              >
                <View style={[
                  styles.markerIcon,
                  { backgroundColor: pharmacy.isVerified ? MedicalColors.verified : MedicalColors.unverified }
                ]}>
                  <Feather name="map-pin" size={14} color="#FFFFFF" />
                </View>
                <View style={styles.pharmacyMapInfo}>
                  <ThemedText type="small" numberOfLines={1} style={{ fontWeight: '600' }}>
                    {pharmacy.name}
                  </ThemedText>
                  <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                    {pharmacy.distance}
                  </ThemedText>
                </View>
              </Pressable>
            ))}
        </View>

        {/* Selected Pharmacy Detail */}
        {selectedPharmacy && (
          <View style={[styles.selectedDetail, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.selectedHeader}>
              <ThemedText type="label">{selectedPharmacy.name}</ThemedText>
              {selectedPharmacy.isVerified && (
                <View style={[styles.verifiedBadge, { backgroundColor: MedicalColors.verified }]}>
                  <Feather name="check" size={10} color="#FFFFFF" />
                  <ThemedText type="caption" style={{ color: '#FFFFFF', marginLeft: 2 }}>Verified</ThemedText>
                </View>
              )}
            </View>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {selectedPharmacy.address} • {selectedPharmacy.distance}
            </ThemedText>
            <View style={styles.selectedActions}>
              <Button 
                size="small" 
                onPress={() => openInGoogleMaps(selectedPharmacy)}
                style={{ flex: 1 }}
              >
                🗺️ Get Directions
              </Button>
            </View>
          </View>
        )}

        {/* Hint for Mobile */}
        {!selectedPharmacy && (
          <View style={styles.hintContainer}>
            <Feather name="smartphone" size={16} color={theme.textSecondary} />
            <ThemedText type="caption" style={{ color: theme.textSecondary, marginLeft: Spacing.sm }}>
              Tap a pharmacy above or use Expo Go for full map view
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapPlaceholder: {
    height: "35%",
    minHeight: 220,
    position: "relative",
  },
  locationBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  openMapsLink: {
    flexDirection: "row",
    alignItems: "center",
  },
  mapContent: {
    flex: 1,
    padding: Spacing.md,
  },
  pharmacyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  pharmacyMapCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    width: "48%",
  },
  markerIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  pharmacyMapInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  selectedDetail: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  selectedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  selectedActions: {
    flexDirection: "row",
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  hintContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.lg,
  },
});
