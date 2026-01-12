import React, { useRef } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import {
  Spacing,
  BorderRadius,
  Shadows,
  MedicalColors,
} from "@/constants/theme";

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

export function MapViewContainer({
  region,
  onRegionChange,
  pharmacies,
  userLocation,
  locationPermission,
}: MapViewContainerProps) {
  const { theme } = useTheme();
  const mapRef = useRef<MapView>(null);

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          ...userLocation,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        500,
      );
    }
  };

  return (
    <View style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        showsUserLocation={locationPermission}
        showsMyLocationButton={false}
        onRegionChangeComplete={onRegionChange}
      >
        {pharmacies
          .filter((p) => p.latitude !== 0)
          .map((pharmacy) => (
            <Marker
              key={pharmacy.id}
              coordinate={{
                latitude: pharmacy.latitude,
                longitude: pharmacy.longitude,
              }}
              title={pharmacy.name}
              description={`${pharmacy.address} - ${pharmacy.distance}`}
              pinColor={
                pharmacy.isVerified
                  ? MedicalColors.verified
                  : MedicalColors.unverified
              }
            />
          ))}
      </MapView>
      <View style={styles.mapOverlay}>
        <Pressable
          style={[
            styles.myLocationButton,
            { backgroundColor: theme.backgroundRoot },
          ]}
          onPress={centerOnUser}
        >
          <Feather name="navigation" size={20} color={theme.primary} />
        </Pressable>
      </View>
      <View style={styles.mapLegend}>
        <View
          style={[styles.legendItem, { backgroundColor: theme.backgroundRoot }]}
        >
          <View
            style={[
              styles.legendDot,
              { backgroundColor: MedicalColors.verified },
            ]}
          />
          <ThemedText type="caption">Verified</ThemedText>
        </View>
        <View
          style={[styles.legendItem, { backgroundColor: theme.backgroundRoot }]}
        >
          <View
            style={[
              styles.legendDot,
              { backgroundColor: MedicalColors.unverified },
            ]}
          />
          <ThemedText type="caption">Unverified</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: "35%",
    position: "relative",
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    position: "absolute",
    top: Spacing.lg,
    right: Spacing.lg,
  },
  myLocationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.small,
  },
  mapLegend: {
    position: "absolute",
    bottom: Spacing.xl + 20,
    left: Spacing.lg,
    flexDirection: "row",
    gap: Spacing.md,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
    ...Shadows.small,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
