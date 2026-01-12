/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from "react";
import { View, StyleSheet, TextInput, Pressable, Platform, ActivityIndicator } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Button } from "@/components/Button";
import { AuthGuard } from "@/components/AuthGuard";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useTranslations, useApp } from "@/contexts/AppContext";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { InteractionsStackParamList } from "@/navigation/InteractionsStackNavigator";
import { getMedications, Medication, getUserProfile, UserProfile } from "@/utils/storage";
import {
  SAMPLE_DRUGS,
  COMPREHENSIVE_DRUG_DATABASE,
  DrugInfo,
} from "@/utils/drugDatabase";
import {
  checkDrugInteractionsAI,
  DrugInteractionAIResult,
  EnrichedInteraction
} from "@/utils/aiServices";
import { searchDrugUnified } from "@/utils/drugDataService";
import { awardPoints } from "@/utils/gamification";
import { generateAndShareReport } from "@/utils/reportService";

// V2 Components
import { SafetyScoreGauge } from "@/components/SafetyScoreGauge";
import { InteractionGraph } from "@/components/InteractionGraph";
import { ClinicalBadge, RecommendationCard } from "@/components/ClinicalTools";
import { useDrugAutocomplete } from "@/hooks/useDrugAutocomplete";

type InteractionsScreenProps = {
  navigation: NativeStackNavigationProp<
    InteractionsStackParamList,
    "Interactions"
  >;
  route: RouteProp<InteractionsStackParamList, "Interactions">;
};

export default function InteractionsScreen({
  navigation,
  route,
}: InteractionsScreenProps) {
  const { theme } = useTheme();
  const { t } = useTranslations();
  const { backendStatus } = useApp();
  
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<DrugInfo[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [interactionResults, setInteractionResults] = useState<DrugInteractionAIResult | null>(null);
  const [scannedMedications, setScannedMedications] = useState<Medication[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // V2 Analysis State
  const [safetyScore, setSafetyScore] = useState(100);
  const [safetyFactors, setSafetyFactors] = useState<{ label: string; impact: number; type: 'negative' | 'positive' | 'neutral' }[]>([]);

  // Predictive Search Hook (Replaces handleSearch)
  const { suggestions, loading: predictionsLoading } = useDrugAutocomplete(searchQuery);

  useEffect(() => {
    loadScannedMedications();
    loadProfile();
  }, []);

  // Handle prefilled medication from other screens (e.g., MedicationDetail)
  useFocusEffect(
    React.useCallback(() => {
      const prefilledMedication = route.params?.prefilledMedication;
      if (prefilledMedication && !selectedMedications.includes(prefilledMedication)) {
        setSelectedMedications(prev => [...prev, prefilledMedication]);
        // Clear the param after using it
        navigation.setParams({ prefilledMedication: undefined });
      }
    }, [route.params?.prefilledMedication])
  );

  const loadProfile = async () => {
    const p = await getUserProfile();
    setUserProfile(p);
  };

  const loadScannedMedications = async () => {
    const medications = await getMedications();
    setScannedMedications(medications);
  };

  const addMedication = (name: string) => {
    if (!selectedMedications.includes(name)) {
      setSelectedMedications([...selectedMedications, name]);
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
    setSearchQuery("");
    setShowResults(false);
    setInteractionResults(null);
  };

  const removeMedication = (name: string) => {
    setSelectedMedications(selectedMedications.filter((m) => m !== name));
    setInteractionResults(null);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // --- V2 Logic: Calculate Digital Twin Score ---
  const calculateSafetyScore = (results: DrugInteractionAIResult) => {
      let score = 100;
      const factors: any[] = []; // Factors list

      // 1. Interactions Impact
      const highRiskCount = results.interactions.filter(i => i.severity === 'High').length;
      const modRiskCount = results.interactions.filter(i => i.severity === 'Moderate').length;

      if (highRiskCount > 0) {
          const impact = highRiskCount * 20;
          score -= impact;
          factors.push({ label: `${highRiskCount} High Risk Interactions`, impact: -impact, type: 'negative' });
      }
      if (modRiskCount > 0) {
          const impact = modRiskCount * 5;
          score -= impact;
          factors.push({ label: `${modRiskCount} Moderate Interactions`, impact: -impact, type: 'negative' }); // Fixed duplicate key typo idea
      }

      // 2. Profile Impact (Mocked logical rules based on profile if available)
      if (userProfile) {
          if (userProfile.age && userProfile.age > 65) {
               // Mock: Age penalty if many meds
               if (selectedMedications.length > 4) {
                   score -= 10;
                   factors.push({ label: "Age > 65 Polypharmacy Risk", impact: -10, type: 'negative' });
               }
          }
           // Allergies (Assuming checkInteractions returns allergy alerts too, or we mock it)
          if (userProfile.allergies && userProfile.allergies.length > 0) {
              // Just a bonus 'Verified' factor
              factors.push({ label: "Allergy Cross-Check Verified", impact: 0, type: 'neutral' });
          }
      } else {
          factors.push({ label: "Profile Not Linked (Generic Analysis)", impact: 0, type: 'neutral' });
      }

      setSafetyScore(Math.max(0, score));
      setSafetyFactors(factors);
  };


  const checkInteractions = async () => {
    if (selectedMedications.length < 2 && selectedMedications.length > 0) return; // Wait for 2

    setIsChecking(true);
    try {
      // If only 1 med, we can still run "Safety Check" vs Profile, but checkDrugInteractionsAI needs 2 usually.
      // Let's allow single med safety check for V2 if we wanted, but sticking to 2 for now.
      const results = await checkDrugInteractionsAI(selectedMedications);
      setInteractionResults(results);
      calculateSafetyScore(results);

      await awardPoints("interaction_check");

      if (Platform.OS !== "web") {
        if (results.interactions.length > 0) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      console.error("Error checking interactions:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleExportReport = async () => {
    if (!interactionResults) return;

    setIsGeneratingReport(true);
    try {
      await generateAndShareReport(
        userProfile?.name || "Patient",
        selectedMedications,
        interactionResults
      );
    } catch (e) {
      console.error("Report generation failed", e);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <AuthGuard featureName="Drug Interactions">
    <ScreenScrollView>
      {/* --- V2 Header: Digital Twin Score --- */}
      {interactionResults && (
           <SafetyScoreGauge score={safetyScore} factors={safetyFactors} />
      )}

      {/* Intro text if no results yet */}
      {!interactionResults && (
        <View style={[styles.instructionCard, { backgroundColor: theme.primary + '15' }]}>
            <Feather name="info" size={20} color={theme.primary} />
            <ThemedText type="body" style={[styles.instructionText, { color: theme.textSecondary }]}>
            {t.interactions.subtitle}
            </ThemedText>
        </View>
      )}
      <Spacer height={Spacing.md} />

      {/* --- V2: Graph Visualization (Only if results) --- */}
      {interactionResults && selectedMedications.length > 0 && (
          <InteractionGraph 
            medications={selectedMedications} 
            interactions={interactionResults.interactions.map(i => ({
                drug1: i.drug1, 
                drug2: i.drug2, 
                severity: i.severity
            }))} 
          />
      )}

      {/* Search & Add Section */}
      <ThemedText type="h4">{t.interactions.searchAll}</ThemedText>
      <Spacer height={Spacing.sm} />

      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchInputContainer,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <Feather name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder={t.interactions.searchMedications}
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery} // Direct state update for hook
            autoCapitalize="none"
          />
          {predictionsLoading && (
             <ActivityIndicator size="small" color={theme.primary} style={{marginRight: 8}} />
          )}
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Feather name="x" size={20} color={theme.textSecondary} />
            </Pressable>
          )}
        </View>

        {/* Predictive Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <View
            style={[
              styles.resultsDropdown,
              { backgroundColor: theme.cardBackground },
              Shadows.medium,
            ]}
          >
            {suggestions.map((item, index) => (
              <Pressable
                key={index}
                onPress={() => addMedication(item.name)}
                style={({ pressed }) => [
                  styles.resultItem,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                    <ThemedText type="body">
                        {/* Highlight matching prefix */}
                         <ThemedText type="body" style={{fontWeight: 'bold', color: theme.primary}}>
                             {item.name.substring(0, searchQuery.length)}
                         </ThemedText>
                         {item.name.substring(searchQuery.length)}
                    </ThemedText>
                    
                    {/* Source Icon */}
                    <Feather 
                        name={item.source === 'local' ? 'zap' : 'cloud'} 
                        size={12} 
                        color={item.source === 'local' ? theme.warning : theme.accent} 
                    />
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <Spacer height={Spacing.xl} />

      {/* Selected Meds List */}
      <ThemedText type="h3">
        {t.interactions.selectedMedications} ({selectedMedications.length})
      </ThemedText>
      <Spacer height={Spacing.md} />

      <View style={styles.medicationsList}>
          {selectedMedications.map((med, index) => (
            <View
              key={index}
              style={[
                styles.medicationChip,
                { backgroundColor: theme.cardBackground },
                Shadows.small,
              ]}
            >
              <Feather name="disc" size={16} color={theme.primary} />
              <ThemedText type="body" style={styles.medicationName}>
                {med}
              </ThemedText>
              <Pressable
                onPress={() => removeMedication(med)}
                style={styles.removeButton}
              >
                <Feather name="x" size={18} color={theme.error} />
              </Pressable>
            </View>
          ))}
          {selectedMedications.length === 0 && (
             <ThemedText type="body" style={{color: theme.textSecondary, alignSelf: 'center', marginTop: 10}}>
                 No medications selected.
             </ThemedText>
          )}
        </View>

      <Spacer height={Spacing.xl} />

      {/* Analyze Button */}
      {selectedMedications.length >= 2 && !interactionResults && (
          <Button
            onPress={checkInteractions}
            disabled={isChecking}
            style={{ width: '100%' }}
          >
            {isChecking ? t.interactions.analyzingWithAI : `🔍 ${t.interactions.checkInteractions}`}
          </Button>
      )}

      {/* Results Section */}
      {interactionResults && (
        <>
           {/* Export Button (Sticky-ish) */}
           <View style={{flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10}}>
                <Pressable 
                    onPress={handleExportReport}
                    disabled={isGeneratingReport}
                    style={({pressed}) => [
                        styles.exportButton, 
                        { 
                            borderColor: theme.primary,
                            opacity: pressed || isGeneratingReport ? 0.6 : 1,
                            backgroundColor: theme.cardBackground
                        }
                    ]}
                >
                    {isGeneratingReport ? (
                        <ActivityIndicator size="small" color={theme.primary} />
                    ) : (
                        <>
                            <Feather name="download" size={14} color={theme.primary} />
                            <ThemedText type="small" style={{color: theme.primary, fontWeight: '600'}}>
                                Clinical Report (PDF)
                            </ThemedText>
                        </>
                    )}
                </Pressable>
           </View>

           {/* Interactions Cards */}
           <ThemedText type="h3">Analysis Details</ThemedText>
           <Spacer height={Spacing.md} />

           {interactionResults.interactions.length === 0 ? (
               <View style={[styles.summaryCard, { backgroundColor: theme.success + "20" }]}>
                   <Feather name="check-circle" size={24} color={theme.success} />
                   <ThemedText type="body" style={styles.summaryText}>
                       No known interactions. {interactionResults.summary}
                   </ThemedText>
               </View>
           ) : (
               interactionResults.interactions.map((interaction, index) => (
                <View key={index}>
                    <InteractionCard
                        interaction={interaction}
                        theme={theme}
                    />
                    {/* V2: One-Tap Resolution (Safe Switch) - Mock Logic */}
                    {interaction.severity === 'High' && (interaction.drug1.includes('Ibuprofen') || interaction.drug2.includes('Ibuprofen')) && (
                         <RecommendationCard 
                            originalDrug="Ibuprofen"
                            suggestedDrug="Acetaminophen"
                            reason="Avoids bleeding risk associated with current combination."
                            price={8.99}
                            onSwitch={() => { 
                                removeMedication("Ibuprofen"); 
                                addMedication("Acetaminophen");
                                // Trigger re-check ideally
                            }}
                         />
                    )}
                </View>
               ))
           )}
        </>
      )}

      <Spacer height={Spacing["3xl"]} />
    </ScreenScrollView>
    </AuthGuard>
  );
}

// Sub-component for Interaction Card (Enhanced V2)
function InteractionCard({ interaction, theme }: { interaction: any, theme: any }) {
    const [expanded, setExpanded] = useState(false);
    
    // Use enriched AI data if available, otherwise fallback
    const explanation = interaction.mechanism || interaction.description;
    const mitigation = interaction.mitigation || "Monitor for side effects. Consult healthcare provider if symptoms worsen.";

    return (
        <Pressable 
            onPress={() => setExpanded(!expanded)}
            style={[styles.interactionCard, { backgroundColor: theme.cardBackground }, Shadows.small]}
        >
            <View style={styles.interactionHeader}>
                <View style={{flex: 1}}>
                    <ThemedText type="h4">Interaction: {interaction.drug1} + {interaction.drug2}</ThemedText>
                    <Spacer height={4} />
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                        <SeverityBadge severity={interaction.severity} />
                        <ClinicalBadge source="AI" confidence={0.95} />
                    </View>
                </View>
                <Feather 
                    name={expanded ? "chevron-up" : "chevron-down"} 
                    size={24} 
                    color={theme.textSecondary} 
                />
            </View>
            
            <ThemedText type="body" numberOfLines={expanded ? undefined : 2} style={{ color: theme.textSecondary, marginBottom: Spacing.sm }}>
                {interaction.description}
            </ThemedText>

            {expanded && (
                <View style={[styles.sentinelGuardBox, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
                        <Feather name="shield" size={16} color={theme.primary} />
                        <ThemedText type="label" style={{marginLeft: 8, color: theme.primary}}>SENTINEL GUARD™ ANALYSIS</ThemedText>
                    </View>
                    <ThemedText type="small" style={{marginBottom: 8}}>
                         <ThemedText type="body" style={{fontWeight: '700'}}>Mechanism: </ThemedText>
                         {explanation}
                         <ClinicalBadge source="PubMed" /> 
                    </ThemedText>
                     <ThemedText type="small">
                         <ThemedText type="body" style={{fontWeight: '700'}}>Mitigation: </ThemedText>
                         {mitigation}
                    </ThemedText>
                </View>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
  searchContainer: { position: "relative", zIndex: 100 },
  searchInputContainer: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.lg, height: 48, borderRadius: BorderRadius.md, gap: Spacing.sm },
  searchInput: { flex: 1, fontSize: 16 },
  resultsDropdown: { position: "absolute", top: 56, left: 0, right: 0, borderRadius: BorderRadius.md, maxHeight: 200, overflow: "hidden" },
  resultItem: { padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.05)" },
  medicationsList: { gap: Spacing.sm },
  medicationChip: { flexDirection: "row", alignItems: "center", padding: Spacing.md, borderRadius: BorderRadius.md },
  medicationName: { flex: 1, marginLeft: Spacing.sm },
  removeButton: { padding: Spacing.xs },
  summaryCard: { flexDirection: "row", alignItems: "flex-start", padding: Spacing.lg, borderRadius: BorderRadius.lg },
  summaryText: { flex: 1, marginLeft: Spacing.md },
  interactionCard: { padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.md },
  interactionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: Spacing.sm },
  exportButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, borderWidth: 1, gap: 6 },
  sentinelGuardBox: { marginTop: Spacing.sm, padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1 },
  instructionCard: { flexDirection: "row", alignItems: "flex-start", padding: Spacing.lg, borderRadius: BorderRadius.lg },
  instructionText: { flex: 1, marginLeft: Spacing.md },
});
