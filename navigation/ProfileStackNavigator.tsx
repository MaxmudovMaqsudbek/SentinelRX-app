import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "@/screens/ProfileScreen";
import RewardsScreen from "@/screens/RewardsScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import FamilyPanelScreen from "@/screens/FamilyPanelScreen";
import TravelScreen from "@/screens/TravelScreen";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type ProfileStackParamList = {
  Profile: undefined;
  Rewards: undefined;
  Settings: undefined;
  FamilyPanel: undefined;
  Travel: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator screenOptions={getCommonScreenOptions({ theme, isDark })}>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerTitle: "Profile" }}
      />
      <Stack.Screen
        name="Rewards"
        component={RewardsScreen}
        options={{ headerTitle: "Rewards" }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerTitle: "Settings" }}
      />
      <Stack.Screen
        name="FamilyPanel"
        component={FamilyPanelScreen}
        options={{ headerTitle: "Family Panel" }}
      />
      <Stack.Screen
        name="Travel"
        component={TravelScreen}
        options={{ headerTitle: "Travel Mode" }}
      />
    </Stack.Navigator>
  );
}
