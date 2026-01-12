import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Platform,
  Linking,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";

import { ThemedText } from "@/components/ThemedText";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { Button } from "@/components/Button";
import { AuthGuard } from "@/components/AuthGuard";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { ProfileStackParamList } from "@/navigation/ProfileStackNavigator";
import {
  getUserProfile,
  getSettings,
  saveSettings,
  UserProfile,
  Settings,
} from "@/utils/storage";
import {
  CountryInfo,
  COUNTRIES,
  PHARMACY_PHRASES,
  formatCurrency,
  convertCurrency,
  detectCurrentCountry,
  translateMedication,
  TRAVEL_HEALTH_TIPS,
} from "@/utils/tourism";
import { CustomsCertificateCard, PharmacistCard, EmergencyRow } from "@/components/TravelFeatures";

type TravelScreenProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, "Travel">;
};

const SAMPLE_MEDICATIONS = [
  "Aspirin",
  "Ibuprofen",
  "Acetaminophen",
  "Omeprazole",
  "Metformin",
];

export default function TravelScreen({ navigation }: TravelScreenProps) {
  const { theme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [detectedCountry, setDetectedCountry] = useState<CountryInfo | null>(
    null,
  );
  const [isDetecting, setIsDetecting] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo | null>(
    null,
  );
  const [pharmacistLanguage, setPharmacistLanguage] = useState<string>("uz"); // Default to Uzbek
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [locationPermission, requestLocationPermission] =
    Location.useForegroundPermissions();

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const [profileData, settingsData] = await Promise.all([
          getUserProfile(),
          getSettings(),
        ]);
        setProfile(profileData);
        setSettings(settingsData);

        if (
          settingsData.travelDestination &&
          COUNTRIES[settingsData.travelDestination]
        ) {
          setSelectedCountry(COUNTRIES[settingsData.travelDestination]);
          // Sync language
           setPharmacistLanguage(COUNTRIES[settingsData.travelDestination].languageCode);
        } else {
            // Default Uzbekistan
            setPharmacistLanguage("uz");
        }

        if (settingsData.medicalTourismMode && locationPermission?.granted) {
          detectLocation();
        }
      };
      loadData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locationPermission?.granted]),
  );

  const detectLocation = async () => {
    if (Platform.OS === "web") {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        const countryCode = data.country_code;
        if (COUNTRIES[countryCode]) {
          setDetectedCountry(COUNTRIES[countryCode]);
          if (!selectedCountry) {
            setSelectedCountry(COUNTRIES[countryCode]);
          }
        }
      } catch {
        console.log("Could not detect location via IP");
      }
      return;
    }

    if (!locationPermission?.granted) {
      const result = await requestLocationPermission();
      if (!result.granted) {
        return;
      }
    }

    setIsDetecting(true);
    try {
      const country = await detectCurrentCountry();
      if (country) {
        setDetectedCountry(country);
        if (!selectedCountry) {
          setSelectedCountry(country);
        }
      }
    } catch (error) {
      console.log("Location detection error:", error);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSelectCountry = async (country: CountryInfo) => {
    setSelectedCountry(country);
    if (settings) {
      const updatedSettings = { ...settings, travelDestination: country.code };
      setSettings(updatedSettings);
      await saveSettings(updatedSettings);
    }
  };

  const openSettings = async () => {
    if (Platform.OS !== "web") {
      try {
        await Linking.openSettings();
      } catch {
        console.log("Could not open settings");
      }
    }
  };

  const speakPhrase = async (phrase: string) => {
    if (isSpeaking) {
      await Speech.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    const langCode = selectedCountry?.languageCode || "en";

    await Speech.speak(phrase, {
      language: langCode,
      rate: 0.8,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const destinationCountry = selectedCountry || COUNTRIES.UZ;
  const homeCurrency = profile?.currency || "USD";
  const localCurrency = destinationCountry.currency;
  const localLang = destinationCountry.languageCode;
  const phrases = PHARMACY_PHRASES[localLang] || PHARMACY_PHRASES.en;
  const healthTips = TRAVEL_HEALTH_TIPS[destinationCountry.code] || [];

  const countryList = Object.values(COUNTRIES);

  return (
    <AuthGuard featureName="Travel Mode">
      <ScreenScrollView>
      <View style={[styles.headerCard, { backgroundColor: theme.primary }]}>
        <Feather name="globe" size={32} color="#FFFFFF" />
        <Spacer height={Spacing.md} />
        <ThemedText type="h2" style={{ color: "#FFFFFF" }}>
          Uzbekistan Medical Passport
        </ThemedText>
        <ThemedText type="body" style={{ color: "rgba(255,255,255,0.8)" }}>
          Official Medical Clearance & Translation
        </ThemedText>
      </View>

      <Spacer height={Spacing.xl} />

      {/* INVESTOR FEATURE: Customs Certificate */}
      <CustomsCertificateCard 
          userName={profile?.name || "Guest User"}
          medicationCount={5} // Mock dynamic count
          destination="Tashkent, Uzbekistan"
      />

      <Spacer height={Spacing.xl} />

      {/* INVESTOR FEATURE: Pharmacist Helper */}
      <ThemedText type="h3">Pharmacist Assistance</ThemedText>
      <Spacer height={Spacing.md} />
      <PharmacistCard 
          language={pharmacistLanguage} 
          onToggleLanguage={() => {
              setPharmacistLanguage(prev => prev === 'uz' ? 'ru' : 'uz');
          }} 
      />

      <Spacer height={Spacing.xl} />

      {/* INVESTOR FEATURE: Emergency Numbers */}
      <ThemedText type="h3">Emergency Contacts (Uzbekistan)</ThemedText>
      <Spacer height={Spacing.md} />
      
      <EmergencyRow 
          number="103" 
          label="Ambulance (Tez Yordam)" 
          icon="activity" 
          onCall={() => Linking.openURL('tel:103')}
      />
      <EmergencyRow 
          number="102" 
          label="Police (Militsiya)" 
          icon="shield" 
          onCall={() => Linking.openURL('tel:102')}
      />
      <EmergencyRow 
          number="+998 71 200 00 00" 
          label="Tourist Police" 
          icon="map-pin" 
          onCall={() => Linking.openURL('tel:+998712000000')}
      />

      <Spacer height={Spacing.xl} />

      <ThemedText type="h3">Currency Conversion</ThemedText>
      <Spacer height={Spacing.md} />

      <View
        style={[
          styles.card,
          { backgroundColor: theme.cardBackground },
          Shadows.small,
        ]}
      >
        <View style={styles.conversionHeader}>
          <View style={styles.currencyBox}>
            <ThemedText type="h2" style={{ color: theme.primary }}>
              {formatCurrency(100, homeCurrency)}
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {homeCurrency}
            </ThemedText>
          </View>
          <Feather name="arrow-right" size={24} color={theme.textSecondary} />
          <View style={styles.currencyBox}>
            <ThemedText type="h2" style={{ color: theme.accent }}>
              {formatCurrency(
                convertCurrency(100, homeCurrency, "UZS"),
                "UZS",
              )}
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              UZS (Som)
            </ThemedText>
          </View>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <ThemedText
          type="caption"
          style={{ color: theme.textSecondary, textAlign: "center" }}
        >
          Exchange rate: 1 {homeCurrency} ={" "}
          {formatCurrency(
            convertCurrency(1, homeCurrency, "UZS"),
            "UZS",
          )}
        </ThemedText>
      </View>

      <Spacer height={Spacing["3xl"]} />
    </ScreenScrollView>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: "center",
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  detectingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
  },
  permissionDeniedContainer: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationInfo: {
    flex: 1,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  countryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  countryChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  conversionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: Spacing.md,
  },
  currencyBox: {
    alignItems: "center",
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  translationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
  },
  translationText: {
    flex: 1,
  },
  phraseRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
  },
  phraseText: {
    flex: 1,
  },
  phraseActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  infoText: {
    flex: 1,
  },
  tipsContainer: {
    paddingTop: Spacing.sm,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
});
