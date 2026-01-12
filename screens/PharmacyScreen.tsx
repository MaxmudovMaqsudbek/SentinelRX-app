/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  Platform,
  Linking,
  ActivityIndicator,
  StatusBar,
  Keyboard,
  RefreshControl,
  Image
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useScreenInsets } from "@/hooks/useScreenInsets";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { PharmacyStackParamList } from "@/navigation/PharmacyStackNavigator";
import { searchPharmaciesNear, PharmacyLocation } from "@/utils/pharmacyService";

type PharmacyScreenProps = {
  navigation: NativeStackNavigationProp<PharmacyStackParamList, "Pharmacy">;
};

type FilterType = "all" | "open" | "verified" | "24hours";

export default function PharmacyScreen({ navigation }: PharmacyScreenProps) {
  const { theme, isDark } = useTheme();
  const { paddingBottom, paddingTop } = useScreenInsets();

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [pharmacies, setPharmacies] = useState<PharmacyLocation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(""); // Moved up
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    getLocation();
  }, []);

  /* --- Debounced Search Effect --- */
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Trigger API search when debounced query changes
  useEffect(() => {
    if (userLocation) {
      fetchPharmacies(userLocation.latitude, userLocation.longitude, debouncedSearchQuery);
    }
  }, [debouncedSearchQuery]);

const TASHKENT_COORDS = { latitude: 41.2995, longitude: 69.2401 };

  const getLocation = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission denied. Showing Tashkent pharmacies.");
        // Fallback to Tashkent for manual testing
        setUserLocation(TASHKENT_COORDS);
        await fetchPharmacies(TASHKENT_COORDS.latitude, TASHKENT_COORDS.longitude);
        return;
      }
      
      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        await fetchPharmacies(loc.coords.latitude, loc.coords.longitude);
      } catch (locError) {
         console.warn("GPS failed, using Tashkent default", locError);
         setUserLocation(TASHKENT_COORDS);
         await fetchPharmacies(TASHKENT_COORDS.latitude, TASHKENT_COORDS.longitude);
      }
      
    } catch (e) {
      console.error("Location error:", e);
      setErrorMsg("Location error. Using default.");
      setUserLocation(TASHKENT_COORDS);
      await fetchPharmacies(TASHKENT_COORDS.latitude, TASHKENT_COORDS.longitude);
    }
  };

  const fetchPharmacies = async (lat: number, lon: number, query?: string) => {
    try {
      setIsLoading(true);
      // Pass query to service
      const results = await searchPharmaciesNear(lat, lon, 50.0, query); 
      setPharmacies(results);
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    if (userLocation) {
      // Pass current search query on refresh too
      fetchPharmacies(userLocation.latitude, userLocation.longitude, debouncedSearchQuery);
    } else {
      getLocation();
    }
  }, [userLocation, debouncedSearchQuery]);

  const openDirections = (p: PharmacyLocation) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${p.name}@${p.latitude},${p.longitude}`,
      android: `geo:0,0?q=${p.latitude},${p.longitude}(${p.name})`,
      default: `https://www.google.com/maps/search/?api=1&query=${p.latitude},${p.longitude}`,
    });
    if (url) Linking.openURL(url);
  };

  /* --- Debounced Search (Moved to top state) --- */
  // Effects handled at top


  const filteredPharmacies = useMemo(() => {
    return pharmacies.filter((p) => {
      // REMOVED client-side text name filtering because we are now doing Server-Side Search via Google API.
      // If we filter locally, we might hide relevant results returned by Google (e.g. searching "near me").
      
      switch (selectedFilter) {
        case "open": return p.isOpen;
        case "verified": return p.isVerified;
        case "24hours": return p.is24Hours;
        default: return true;
      }
    });
  }, [pharmacies, selectedFilter]);

  const filters: { id: FilterType; label: string }[] = [
    { id: "all", label: "All" },
    { id: "open", label: "Open" },
    { id: "verified", label: "Verified" },
    { id: "24hours", label: "24h" },
  ];

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: theme.backgroundSecondary }]}>
        <Feather name="search" size={18} color={theme.textSecondary} />
        <TextInput
          placeholder="Search..."
          placeholderTextColor={theme.textSecondary}
          style={[styles.searchInput, { color: theme.text }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onSubmitEditing={Keyboard.dismiss}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")} hitSlop={10}>
            <Feather name="x" size={16} color={theme.textSecondary} />
          </Pressable>
        )}
      </View>
      <Spacer height={Spacing.sm} />
      {/* Filters */}
      <View style={styles.filterRow}>
        {filters.map((f) => (
          <Pressable
            key={f.id}
            onPress={() => setSelectedFilter(f.id)}
            style={[
              styles.filterChip,
              {
                backgroundColor: selectedFilter === f.id ? theme.primary : theme.backgroundSecondary,
              },
            ]}
          >
            <ThemedText style={{ fontSize: 12, fontWeight: "600", color: selectedFilter === f.id ? "#FFF" : theme.text }}>
              {f.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>
      <Spacer height={Spacing.md} />
      {/* Location Status */}
      <View style={styles.locationStatus}>
        <Feather name="map-pin" size={14} color={userLocation ? theme.success : theme.error} />
        <ThemedText style={{ fontSize: 12, color: theme.textSecondary, marginLeft: 6 }}>
          {errorMsg || (userLocation ? `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}` : "Locating...")}
        </ThemedText>
      </View>
      <Spacer height={Spacing.sm} />
    </View>
  );

  const renderItem = ({ item }: { item: PharmacyLocation }) => (
    <Pressable
      onPress={() => navigation.navigate("PharmacyDetail", { pharmacyId: item.id })}
      style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
    >
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.cardImage}
          resizeMode="cover"
        />
      ) : null}

      <View style={styles.cardInner}>
        <View style={styles.cardRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <ThemedText type="h4" numberOfLines={1}>{item.name}</ThemedText>
            <ThemedText style={{ fontSize: 13, color: theme.textSecondary, marginTop: 2 }} numberOfLines={1}>
              {item.address}
            </ThemedText>
          </View>
          <View style={[styles.ratingBadge, { backgroundColor: theme.backgroundSecondary }]}> 
            <Feather name="star" size={12} color="#F59E0B" />
            <ThemedText style={{ fontSize: 12, fontWeight: "700", color: theme.text, marginLeft: 4 }}>
              {item.rating}
            </ThemedText>
          </View>
        </View>
        
        <Spacer height={Spacing.sm} />

        <View style={styles.cardRow}>
           <View style={[styles.infoTag, { backgroundColor: theme.backgroundSecondary }]}>
            <Feather name="navigation" size={12} color={theme.primary} />
            <ThemedText style={{ fontSize: 12, color: theme.text, marginLeft: 4 }}>{item.distance} • {item.walkingTime} walk</ThemedText>
          </View>

          <View style={[styles.infoTag, { backgroundColor: item.isOpen ? "#DCFCE7" : "#FEE2E2", marginLeft: 8 }]}>
            <ThemedText style={{ fontSize: 12, fontWeight: "600", color: item.isOpen ? "#166534" : "#991B1B" }}>
              {item.isOpen ? "Open Now" : "Closed"}
            </ThemedText>
          </View>
        </View>

        <Spacer height={Spacing.md} />
        <Button onPress={() => openDirections(item)} variant="secondary" size="small">
          Get Directions
        </Button>
      </View>
    </Pressable>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      {isLoading ? (
        <ActivityIndicator size="large" color={theme.primary} />
      ) : errorMsg ? (
        <>
          <Feather name="alert-circle" size={48} color={theme.error} />
          <ThemedText style={{ marginTop: 16, color: theme.textSecondary, textAlign: "center" }}>{errorMsg}</ThemedText>
          <Button onPress={getLocation} style={{ marginTop: 20 }}>Retry</Button>
        </>
      ) : (
        <>
          <Feather name="search" size={48} color={theme.textSecondary} />
          <ThemedText style={{ marginTop: 16, color: theme.textSecondary }}>No pharmacies found.</ThemedText>
        </>
      )}
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={[styles.titleBar, { paddingTop: paddingTop + 8, backgroundColor: theme.backgroundRoot }]}>
        <ThemedText type="h2">Find Pharmacy</ThemedText>
      </View>
      <FlatList
        data={filteredPharmacies}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader()} // Invoke to pass Element, preventing remounts
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[styles.listContent, { paddingBottom: paddingBottom + 20 }]}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[theme.primary]} tintColor={theme.primary} />}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  titleBar: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    marginLeft: Spacing.sm,
    height: "100%",
  },
  filterRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  locationStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    // padding: Spacing.md, // Removed so Image can be full width
    marginBottom: Spacing.md,
    ...Shadows.small,
    overflow: "hidden", // For image border radius
  },
  cardImage: {
    width: "100%",
    height: 150,
    backgroundColor: "#E5E5E5",
  },
  cardInner: {
    padding: Spacing.md,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  infoTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
    paddingHorizontal: Spacing.lg,
  },
});
