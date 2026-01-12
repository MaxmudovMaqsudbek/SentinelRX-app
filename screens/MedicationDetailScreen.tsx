import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { Button } from "@/components/Button";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import { getMedications, Medication, getUserProfile, getGamificationData, UserProfile, GamificationData } from "@/utils/storage";
import { getDrugById, DrugInfo } from "@/utils/drugDatabase";
import { AdherenceStreakCard, ConditionContextBadge, SmartRefillGauge } from "@/components/MedicationDetailFeatures";

type MedicationDetailScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, "MedicationDetail">;
  route: RouteProp<HomeStackParamList, "MedicationDetail">;
};

export default function MedicationDetailScreen({
  navigation,
  route,
}: MedicationDetailScreenProps) {
  const { theme } = useTheme();
  const { medicationId } = route.params;
  const [medication, setMedication] = useState<Medication | null>(null);
  const [drugInfo, setDrugInfo] = useState<DrugInfo | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [gamification, setGamification] = useState<GamificationData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const medications = await getMedications();
      const med = medications.find((m) => m.id === medicationId);
      if (med) {
        setMedication(med);
      }

      const drug = getDrugById(medicationId);
      if (drug) {
        setDrugInfo(drug);
      }

      // Fetch Profile & Gamification for Investor Features
      const [userProfile, gamificationData] = await Promise.all([
          getUserProfile(),
          getGamificationData()
      ]);
      setProfile(userProfile);
      setGamification(gamificationData);
    };
    loadData();
  }, [medicationId]);

  if (!medication && !drugInfo) {
    return (
      <ScreenScrollView>
        <View style={styles.loading}>
          <ThemedText type="body">Loading medication details...</ThemedText>
        </View>
      </ScreenScrollView>
    );
  }

  const displayData = drugInfo || {
    name: medication?.name || "Unknown",
    genericName: medication?.genericName || "",
    manufacturer: medication?.manufacturer || "",
    dosage: medication?.dosage || "",
    shape: medication?.shape || "",
    color: medication?.color || "",
    imprint: medication?.imprint,
    description: "",
    warnings: medication?.warnings || [],
    sideEffects: medication?.sideEffects || [],
    interactions: [],
    pregnancyCategory: "",
    category: "",
  };

  return (
    <ScreenScrollView>
      <View
        style={[
          styles.headerCard,
          { backgroundColor: theme.cardBackground },
          Shadows.medium,
        ]}
      >
        <View
          style={[styles.pillIcon, { backgroundColor: theme.primary + "20" }]}
        >
          <Feather name="disc" size={40} color={theme.primary} />
        </View>
        <ThemedText type="h2" style={styles.medicationName}>
          {displayData.name}
        </ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          {displayData.genericName}
        </ThemedText>
        
        {/* INVESTOR FEATURE: Condition Context Badge */}
        <Spacer height={Spacing.sm} />
        <ConditionContextBadge drug={displayData as DrugInfo} profile={profile} />
      </View>

      <Spacer height={Spacing.lg} />

      {/* INVESTOR FEATURE: Adherence Streak */}
      <AdherenceStreakCard gamification={gamification} medicationName={displayData.name} />

      <Spacer height={Spacing.md} />

      {/* INVESTOR FEATURE: Smart Refill Gauge */}
      {/* Simulating random quantity for demo purposes if not tracked */}
      <SmartRefillGauge
         quantity={7} 
         totalQuantity={30} 
         onFindPharmacy={() => navigation.getParent()?.navigate("PharmacyTab")} 
      />

      <Spacer height={Spacing.xl} />

      <ThemedText type="h3">Details</ThemedText>
      <Spacer height={Spacing.md} />

      <View
        style={[
          styles.detailsCard,
          { backgroundColor: theme.cardBackground },
          Shadows.small,
        ]}
      >
        <View style={styles.detailRow}>
          <ThemedText type="label">Dosage</ThemedText>
          <ThemedText type="body">{displayData.dosage}</ThemedText>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <View style={styles.detailRow}>
          <ThemedText type="label">Manufacturer</ThemedText>
          <ThemedText type="body">{displayData.manufacturer}</ThemedText>
        </View>
        {/* Removed redundant Shape/Color rows to reduce visual noise, kept simplified list */}
        {displayData.imprint ? (
          <>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.detailRow}>
              <ThemedText type="label">Imprint</ThemedText>
              <ThemedText type="body">{displayData.imprint}</ThemedText>
            </View>
          </>
        ) : null}
      </View>

      {drugInfo?.description ? (
        <>
          <Spacer height={Spacing.xl} />
          <ThemedText type="h3">Why am I taking this?</ThemedText>
          <Spacer height={Spacing.md} />
          <View
            style={[styles.infoCard, { backgroundColor: theme.cardBackground }]}
          >
             {/* AI-Like "Plain English" Header */}
             <View style={{flexDirection: 'row', gap: 8, marginBottom: 8}}>
                 <Feather name="info" size={16} color={theme.primary} />
                 <ThemedText type="body" style={{color: theme.primary, fontWeight: '600'}}>Doctor's Note</ThemedText>
             </View>
            <ThemedText type="body">{drugInfo.description}</ThemedText>
          </View>
        </>
      ) : null}

      {displayData.warnings.length > 0 ? (
        <>
          <Spacer height={Spacing.xl} />
          <ThemedText type="h3">Warnings</ThemedText>
          <Spacer height={Spacing.md} />
          <View
            style={[styles.infoCard, { backgroundColor: theme.cardBackground }]}
          >
            {displayData.warnings.slice(0, 3).map((warning, index) => (
              <View key={index} style={styles.warningItem}>
                <Feather name="alert-circle" size={16} color={theme.accent} />
                <ThemedText type="body" style={styles.warningText}>
                  {warning}
                </ThemedText>
              </View>
            ))}
             {displayData.warnings.length > 3 && (
                 <ThemedText type="caption" style={{color: theme.textSecondary, marginTop: 8, textAlign: 'center'}}>
                     + {displayData.warnings.length - 3} more warnings
                 </ThemedText>
             )}
          </View>
        </>
      ) : null}

      <Spacer height={Spacing["2xl"]} />

      <Button
        onPress={() => {
          // Navigate to InteractionsTab and pass the medication name
          const rootNav = navigation.getParent()?.getParent();
          if (rootNav) {
            rootNav.navigate("InteractionsTab", {
              screen: "Interactions",
              params: { prefilledMedication: displayData.name }
            });
          } else {
            // Fallback - try direct navigation
            navigation.getParent()?.navigate("InteractionsTab");
          }
        }}
        style={{ backgroundColor: theme.secondary }}
      >
        Check Interactions
      </Button>

      <Spacer height={Spacing.lg} />

      <Button onPress={() => navigation.navigate("Reminders")}>
        Set Reminder
      </Button>

      <Spacer height={Spacing["3xl"]} />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["4xl"],
  },
  headerCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: "center",
  },
  pillIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  medicationName: {
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  detailsCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  divider: {
    height: 1,
  },
  infoCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  warningItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  warningText: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  tag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  interactionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  interactionText: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
});
