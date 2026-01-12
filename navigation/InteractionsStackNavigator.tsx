import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import InteractionsScreen from "@/screens/InteractionsScreen";
import InteractionResultScreen from "@/screens/InteractionResultScreen";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type InteractionsStackParamList = {
  Interactions: { prefilledMedication?: string } | undefined;
  InteractionResult: { medications: string[] };
};

const Stack = createNativeStackNavigator<InteractionsStackParamList>();

export default function InteractionsStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator screenOptions={getCommonScreenOptions({ theme, isDark })}>
      <Stack.Screen
        name="Interactions"
        component={InteractionsScreen}
        options={{ headerTitle: "Drug Interactions" }}
      />
      <Stack.Screen
        name="InteractionResult"
        component={InteractionResultScreen}
        options={{ headerTitle: "Results" }}
      />
    </Stack.Navigator>
  );
}
