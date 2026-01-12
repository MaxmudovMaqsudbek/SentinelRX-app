import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ScannerScreen from "@/screens/ScannerScreen";
import ScanResultScreen from "@/screens/ScanResultScreen";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

import { EnrichedDrugInfo } from "@/utils/drugDataService";

export type ScannerStackParamList = {
  Scanner: undefined;
  ScanResult: { imageUri?: string; barcodeData?: string; preloadedDrug?: EnrichedDrugInfo };
};

const Stack = createNativeStackNavigator<ScannerStackParamList>();

export default function ScannerStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator screenOptions={getCommonScreenOptions({ theme, isDark })}>
      <Stack.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{
          headerTitle: "Scan Pill",
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="ScanResult"
        component={ScanResultScreen}
        options={{ headerTitle: "Scan Result" }}
      />
    </Stack.Navigator>
  );
}
