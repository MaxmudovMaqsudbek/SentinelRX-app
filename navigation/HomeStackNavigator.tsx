import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "@/screens/HomeScreen";
import RemindersScreen from "@/screens/RemindersScreen";
import MedicationDetailScreen from "@/screens/MedicationDetailScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type HomeStackParamList = {
  Home: undefined;
  Reminders: undefined;
  MedicationDetail: { medicationId: string };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerTitle: () => <HeaderTitle title="SentinelRX" />,
        }}
      />
      <Stack.Screen
        name="Reminders"
        component={RemindersScreen}
        options={{ headerTitle: "Reminders" }}
      />
      <Stack.Screen
        name="MedicationDetail"
        component={MedicationDetailScreen}
        options={{ headerTitle: "Medication Details" }}
      />
    </Stack.Navigator>
  );
}
