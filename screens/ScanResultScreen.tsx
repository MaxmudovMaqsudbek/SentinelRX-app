import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { Button } from "@/components/Button";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useTranslations } from "@/contexts/AppContext";
import {
  Spacing,
  BorderRadius,
  Shadows,
  MedicalColors,
} from "@/constants/theme";
import { ScannerStackParamList } from "@/navigation/ScannerStackNavigator";
import {
  getScanHistory,
  getUserProfile,
  getMedications,
  ScanHistoryItem,
  generateId,
  Medication,
} from "@/utils/storage";
import {
  getDrugById,
  checkSafetyForProfile,
  DrugInfo,
} from "@/utils/drugDatabase";

type ScanResultScreenProps = {
  navigation: NativeStackNavigationProp<ScannerStackParamList, "ScanResult">;
  route: RouteProp<ScannerStackParamList, "ScanResult">;
};

// Premium Components
import { SafetyHero, AuthenticitySeal, PriceBenchmark } from "@/components/ScanResultFeatures";

export default function ScanResultScreen({
  navigation,
  route,
}: ScanResultScreenProps) {
  // ... (hooks remain)
  const { theme } = useTheme();
  const { t } = useTranslations();
  const [scan, setScan] = useState<ScanHistoryItem | null>(null);
  const [drug, setDrug] = useState<DrugInfo | null>(null);
  const [safetyAlerts, setSafetyAlerts] = useState<string[]>([]);

  // ... (useEffect remains unchanged)

  useEffect(() => {
    const loadData = async () => {
      // FAST PATH: Use preloaded data if available
      if (route.params?.preloadedDrug) {
          const preloaded = route.params.preloadedDrug;
          setDrug(preloaded);
          setScan({
              id: generateId(), // Temporary ID for display
              medicationId: preloaded.id,
              medicationName: preloaded.name,
              scannedAt: new Date().toISOString(),
              confidence: 0.99,
              analysisMethod: "database",
              matchDetails: { shape: true, color: true, imprint: true }
          });
          
          // Still fetch profile for safety checks
          const profileData = await getUserProfile();
          const alerts = checkSafetyForProfile(preloaded, profileData);
          setSafetyAlerts(alerts);
          return;
      }

      // SLOW PATH: Fallback to storage load
      const [history, profileData, savedMeds] = await Promise.all([
        getScanHistory(),
        getUserProfile(),
        getMedications(),
      ]);
      
      // ... existing fallback logic for history scan ...
      if (history.length > 0) {
        const latestScan = history[0];
        setScan(latestScan);
        let foundDrug: Medication | DrugInfo | undefined = savedMeds.find(m => m.id === latestScan.medicationId);
        if (!foundDrug) foundDrug = getDrugById(latestScan.medicationId);
        
        if (foundDrug) {
            // Map Medication (Storage) to DrugInfo (Display)
            const mappedDrug: DrugInfo = {
                ...foundDrug,
                id: foundDrug.id,
                name: foundDrug.name,
                genericName: foundDrug.genericName,
                dosage: foundDrug.dosage,
                manufacturer: foundDrug.manufacturer,
                shape: foundDrug.shape,
                color: foundDrug.color,
                imprint: foundDrug.imprint,
                // Mandatory DrugInfo fields that might be missing in Medication
                description: foundDrug.description || "Description not available",
                interactions: foundDrug.interactions || [],
                warnings: foundDrug.warnings || [],
                sideEffects: foundDrug.sideEffects || [],
                pregnancyCategory: foundDrug.pregnancyCategory || "Unknown",
                category: foundDrug.category || "Rx",
                price: foundDrug.price
            };
            setDrug(mappedDrug);
            const alerts = checkSafetyForProfile(mappedDrug, profileData);
            setSafetyAlerts(alerts);
        }
      }
    };
    loadData();
  }, [route.params?.barcodeData, route.params?.preloadedDrug]);

  if (!scan || !drug) {
    return (
      <ScreenScrollView>
        <View style={styles.loading}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Spacer height={Spacing.md} />
            <ThemedText type="body">Analyzing logistics chain...</ThemedText>
        </View>
      </ScreenScrollView>
    );
  }

  // Determine Safety Status
  let safetyStatus: "safe" | "caution" | "danger" = "safe";
  if (safetyAlerts.length > 0) safetyStatus = "danger";
  else if ((drug.warnings || []).length > 0) safetyStatus = "caution";

  const confidenceColor = scan.confidence >= 0.9 ? theme.success : theme.accent;

  return (
    <ScreenScrollView>
      {/* 1. Safety Hero Header */}
      <SafetyHero 
        status={safetyStatus} 
        drugName={drug.name} 
        alertsCount={safetyAlerts.length} 
      />

      {/* 2. Authenticity Seal (Simulated for Barcodes) */}
      <AuthenticitySeal 
        batchNumber={scan.batchNumber || "KV-8842-X"} 
        expirationDate={scan.expirationDate || "12/2026"} 
      />

      <View
        style={[
          styles.resultCard,
          { backgroundColor: theme.cardBackground },
          Shadows.medium,
        ]}
      >
        <View style={styles.resultHeader}>
             {/* Pill Icon and Basic Details */}
            <View
            style={[
              styles.pillIcon,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <Feather name="disc" size={32} color={theme.primary} />
          </View>
          <View style={styles.resultInfo}>
            <ThemedText type="h2">{drug.name}</ThemedText>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              {drug.genericName}
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.confidenceRow}>
          <View style={styles.confidenceInfo}>
            <ThemedText type="label">AI Confidence</ThemedText>
            <View style={styles.analysisMethodRow}>
              <Feather
                name={
                  scan.analysisMethod === "database" ? "check-circle" : "cpu"
                }
                size={12}
                color={theme.textSecondary}
              />
              <ThemedText
                type="small"
                style={{ color: theme.textSecondary, marginLeft: 4 }}
              >
                {scan.analysisMethod === "database"
                  ? "Database Match"
                  : scan.analysisMethod === "ai"
                    ? "AI Analysis"
                    : "Visual Analysis"}
              </ThemedText>
            </View>
          </View>
          <View
            style={[
              styles.confidenceBadge,
              { backgroundColor: confidenceColor },
            ]}
          >
            <ThemedText type="label" style={styles.confidenceText}>
              {Math.round(scan.confidence * 100)}%
            </ThemedText>
          </View>
        </View>

        {scan.matchDetails ? (
          <View style={styles.matchQualityRow}>
            <View
              style={[
                styles.matchIndicator,
                {
                  backgroundColor: scan.matchDetails.shape
                    ? theme.success + "20"
                    : theme.backgroundSecondary,
                },
              ]}
            >
              <Feather
                name="square"
                size={14}
                color={
                  scan.matchDetails.shape ? theme.success : theme.textSecondary
                }
              />
              <ThemedText type="small" style={{ marginLeft: 4 }}>
                Shape
              </ThemedText>
            </View>
            <View
              style={[
                styles.matchIndicator,
                {
                  backgroundColor: scan.matchDetails.color
                    ? theme.success + "20"
                    : theme.backgroundSecondary,
                },
              ]}
            >
              <Feather
                name="droplet"
                size={14}
                color={
                  scan.matchDetails.color ? theme.success : theme.textSecondary
                }
              />
              <ThemedText type="small" style={{ marginLeft: 4 }}>
                Color
              </ThemedText>
            </View>
            <View
              style={[
                styles.matchIndicator,
                {
                  backgroundColor: scan.matchDetails.imprint
                    ? theme.success + "20"
                    : theme.backgroundSecondary,
                },
              ]}
            >
              <Feather
                name="type"
                size={14}
                color={
                  scan.matchDetails.imprint
                    ? theme.success
                    : theme.textSecondary
                }
              />
              <ThemedText type="small" style={{ marginLeft: 4 }}>
                Imprint
              </ThemedText>
            </View>
          </View>
        ) : null}

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Dosage
            </ThemedText>
            <ThemedText type="body">{drug.dosage}</ThemedText>
          </View>
          <View style={styles.detailItem}>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Shape
            </ThemedText>
            <ThemedText type="body">{drug.shape}</ThemedText>
          </View>
          <View style={styles.detailItem}>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Color
            </ThemedText>
            <ThemedText type="body">{drug.color}</ThemedText>
          </View>
          <View style={styles.detailItem}>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Manufacturer
            </ThemedText>
            <ThemedText type="body">{drug.manufacturer}</ThemedText>
          </View>
        </View>
      </View>

      <Spacer height={Spacing.xl} />

      {safetyAlerts.length > 0 ? (
        <>
          <ThemedText type="h3">Safety Alerts</ThemedText>
          <Spacer height={Spacing.md} />
          {safetyAlerts.map((alert, index) => (
            <View
              key={index}
              style={[
                styles.alertCard,
                { backgroundColor: MedicalColors.severityMajor.background },
              ]}
            >
              <Feather
                name="alert-triangle"
                size={20}
                color={MedicalColors.severityMajor.text}
              />
              <ThemedText
                type="body"
                style={[
                  styles.alertText,
                  { color: MedicalColors.severityMajor.text },
                ]}
              >
                {alert}
              </ThemedText>
            </View>
          ))}
          <Spacer height={Spacing.xl} />
        </>
      ) : null}

      <ThemedText type="h3">Warnings</ThemedText>
      <Spacer height={Spacing.md} />
      <View
        style={[styles.infoCard, { backgroundColor: theme.cardBackground }]}
      >
        {(drug.warnings || []).map((warning, index) => (
          <View key={index} style={styles.warningItem}>
            <Feather name="alert-circle" size={16} color={theme.accent} />
            <ThemedText type="body" style={styles.warningText}>
              {warning}
            </ThemedText>
          </View>
        ))}
      </View>

      <Spacer height={Spacing.xl} />

      <ThemedText type="h3">Side Effects</ThemedText>
      <Spacer height={Spacing.md} />
      <View
        style={[styles.infoCard, { backgroundColor: theme.cardBackground }]}
      >
        <View style={styles.sideEffectsGrid}>
          {(drug.sideEffects || []).map((effect, index) => (
            <View
              key={index}
              style={[
                styles.sideEffectBadge,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <ThemedText type="small">{effect}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      <Spacer height={Spacing.xl} />

      <ThemedText type="h3">Known Interactions</ThemedText>
      <Spacer height={Spacing.md} />
      <View
        style={[styles.infoCard, { backgroundColor: theme.cardBackground }]}
      >
        {(drug.interactions || []).map((interaction, index) => (
          <View key={index} style={styles.interactionItem}>
            <Feather name="x-circle" size={16} color={theme.error} />
            <ThemedText type="body" style={styles.interactionText}>
              {interaction}
            </ThemedText>
          </View>
        ))}
      </View>

      <Spacer height={Spacing["2xl"]} />

      {/* 3. Fair Price Benchmark */}
      <PriceBenchmark 
        drugName={drug!.name} 
        onCheckPrices={() => navigation.getParent()?.navigate("PharmacyTab")} 
      />

      <Spacer height={Spacing.lg} />

      <Button
        onPress={() =>
          navigation.getParent()?.navigate("InteractionsTab")
        }
        style={{ backgroundColor: theme.secondary }}
      >
        Check Drug Interactions
      </Button>

      <Spacer height={Spacing.lg} />

      <Button
        onPress={() =>
          navigation.getParent()?.navigate("PharmacyTab")
        }
      >
        Find Nearby Pharmacies
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
  resultCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  pillIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  resultInfo: {
    flex: 1,
  },
  confidenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  confidenceInfo: {
    flex: 1,
  },
  analysisMethodRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  confidenceBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  confidenceText: {
    color: "#FFFFFF",
  },
  matchQualityRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  matchIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -Spacing.sm,
  },
  detailItem: {
    width: "50%",
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  alertText: {
    flex: 1,
    marginLeft: Spacing.md,
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
  sideEffectsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  sideEffectBadge: {
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
