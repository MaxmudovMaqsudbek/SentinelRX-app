import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PharmacyScreen from "@/screens/PharmacyScreen";
import PharmacyDetailScreen from "@/screens/PharmacyDetailScreen";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type PharmacyStackParamList = {
  Pharmacy: undefined;
  PharmacyDetail: { pharmacyId: string };
};

const Stack = createNativeStackNavigator<PharmacyStackParamList>();

export default function PharmacyStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator screenOptions={getCommonScreenOptions({ theme, isDark })}>
      <Stack.Screen
        name="Pharmacy"
        component={PharmacyScreen}
        options={{ headerTitle: "Find Pharmacy" }}
      />
      <Stack.Screen
        name="PharmacyDetail"
        component={PharmacyDetailScreen}
        options={{ headerTitle: "Pharmacy Details" }}
      />
    </Stack.Navigator>
  );
}
