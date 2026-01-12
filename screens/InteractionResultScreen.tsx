import React from "react";
import { View, StyleSheet } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { InteractionsStackParamList } from "@/navigation/InteractionsStackNavigator";

type InteractionResultScreenProps = {
  navigation: NativeStackNavigationProp<
    InteractionsStackParamList,
    "InteractionResult"
  >;
  route: RouteProp<InteractionsStackParamList, "InteractionResult">;
};

export default function InteractionResultScreen({
  navigation,
  route,
}: InteractionResultScreenProps) {
  return (
    <ScreenScrollView>
      <View style={styles.container}>
        <ThemedText type="body">
          Interaction results will display here.
        </ThemedText>
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
