import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HomeStackNavigator from "@/navigation/HomeStackNavigator";
import InteractionsStackNavigator from "@/navigation/InteractionsStackNavigator";
// import AIAssistantScreen from "@/screens/AIAssistantScreen"; // Moved to Global Button
import ScannerStackNavigator from "@/navigation/ScannerStackNavigator";
import PharmacyStackNavigator from "@/navigation/PharmacyStackNavigator";
import ProfileStackNavigator from "@/navigation/ProfileStackNavigator";
import { useTheme } from "@/hooks/useTheme";
import { useTranslations } from "@/contexts/AppContext";
import { Spacing } from "@/constants/theme";

export type MainTabParamList = {
  HomeTab: undefined;
  InteractionsTab: undefined;
  ScannerTab: undefined;
  PharmacyTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslations();
  const insets = useSafeAreaInsets();
  
  // Calculate proper bottom padding for Android edge-to-edge
  const bottomPadding = Platform.OS === "android" ? Math.max(insets.bottom, 16) + 8 : 28;
  const tabBarHeight = Platform.OS === "ios" ? 88 : 64 + Math.max(insets.bottom, 0);

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: theme.backgroundRoot,
          }),
          borderTopWidth: 0,
          elevation: 0,
          height: tabBarHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          title: t.tabs.home,
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="InteractionsTab"
        component={InteractionsStackNavigator}
        options={{
          title: t.tabs.interactions,
          tabBarIcon: ({ color, size }) => (
            <Feather name="alert-circle" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ScannerTab"
        component={ScannerStackNavigator}
        options={{
          title: t.tabs.scanner,
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={[
                styles.scannerIcon,
                {
                  backgroundColor: theme.primary,
                },
                focused && styles.scannerIconFocused,
              ]}
            >
              {/* Modern QR/Scan Icon Design */}
              <View style={styles.scannerIconInner}>
                {/* Corner brackets - like QR scanner */}
                <View style={[styles.scanCorner, styles.scanCornerTL]} />
                <View style={[styles.scanCorner, styles.scanCornerTR]} />
                <View style={[styles.scanCorner, styles.scanCornerBL]} />
                <View style={[styles.scanCorner, styles.scanCornerBR]} />
                {/* Center scan line */}
                <View style={styles.scanLine} />
              </View>
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen
        name="PharmacyTab"
        component={PharmacyStackNavigator}
        options={{
          title: t.tabs.pharmacy,
          tabBarIcon: ({ color, size }) => (
            <Feather name="map-pin" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          title: t.tabs.profile,
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  scannerIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -Spacing.xl,
    shadowColor: "#004575",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  scannerIconFocused: {
    transform: [{ scale: 1.05 }],
  },
  scannerIconInner: {
    width: 26,
    height: 26,
    position: "relative",
  },
  scanCorner: {
    position: "absolute",
    width: 8,
    height: 8,
    borderColor: "#FFFFFF",
    borderWidth: 2,
  },
  scanCornerTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 3,
  },
  scanCornerTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 3,
  },
  scanCornerBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 3,
  },
  scanCornerBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 3,
  },
  scanLine: {
    position: "absolute",
    top: "50%",
    left: 4,
    right: 4,
    height: 2,
    backgroundColor: "#00A5B5",
    borderRadius: 1,
    marginTop: -1,
  },
});
