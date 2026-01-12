import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Platform,
  ActivityIndicator,
  Linking,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useTranslations } from "@/contexts/AppContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { ScannerStackParamList } from "@/navigation/ScannerStackNavigator";
import { analyzePillImage, analyzeDataMatrix } from "@/utils/aiServices";
import { addScanToHistory, saveMedication, generateId } from "@/utils/storage";
import { awardPoints } from "@/utils/gamification";
import { identifyBarcodeUnified } from "@/utils/drugDataService";
import { syncScanToCloud, syncMedicationToCloud } from "@/utils/syncEngine";

type ScannerScreenProps = {
  navigation: NativeStackNavigationProp<ScannerStackParamList, "Scanner">;
};


export default function ScannerScreen({ navigation }: ScannerScreenProps) {
  const { theme } = useTheme();
  // ... hooks ...
  const { t, language } = useTranslations();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [scanMode, setScanMode] = useState<"pill" | "barcode">("pill");
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  const handleBarcodeScanned = async (result: BarcodeScanningResult) => {
    if (isScanning || result.data === lastScannedBarcode) return;

    setLastScannedBarcode(result.data);
    setIsScanning(true);

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    try {
      // Use Unified Smart Engine
      const unifiedResult = await identifyBarcodeUnified(result.data, result.type);

      if (unifiedResult) {
        // FAST PATH: Navigate IMMEDIATELY
        // Pass the full object so ScanResultScreen doesn't have to wait for storage
        navigation.navigate("ScanResult", { 
            barcodeData: result.data,
            preloadedDrug: unifiedResult 
        });

        // BACKGROUND TASKS: Save to storage asynchronously (Fire & Forget)
        Promise.all([
             saveMedication({
              id: unifiedResult.id || generateId(),
              name: unifiedResult.name,
              genericName: unifiedResult.genericName,
              dosage: unifiedResult.dosage,
              manufacturer: unifiedResult.manufacturer,
              shape: unifiedResult.shape,
              color: unifiedResult.color,
              imprint: unifiedResult.imprint,
              scannedAt: new Date().toISOString(),
              warnings: unifiedResult.warnings,
              sideEffects: unifiedResult.sideEffects,
              interactions: unifiedResult.interactions || [],
            }),
            addScanToHistory({
              id: generateId(),
              medicationId: unifiedResult.id || generateId(),
              medicationName: unifiedResult.name,
              scannedAt: new Date().toISOString(),
              confidence: 0.99,
              analysisMethod: "database",
              matchDetails: { shape: true, color: true, imprint: true },
            }),
            // 🔄 Sync to cloud
            syncScanToCloud(unifiedResult.name, 0.99),
            syncMedicationToCloud({ name: unifiedResult.name, dosage: unifiedResult.dosage }),
            awardPoints("scan", unifiedResult.name)
        ]).catch(err => console.error("Background Save Error:", err));
      }
    } catch (error) {
      console.error("Error analyzing barcode:", error);
    } finally {
      setIsScanning(false);
      // Faster reset for rapid scanning
      setTimeout(() => setLastScannedBarcode(null), 1500);
    }
  };

  const handleCapture = async () => {
    if (isScanning) return;

    setIsScanning(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      let imageUri = "";

      if (Platform.OS !== "web" && cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync();
        imageUri = photo?.uri || "";
      }

      const result = await analyzePillImage(imageUri);

      if (!result.medication) {
        console.error("No medication identified from image");
        return;
      }

      const medication = result.medication;

      await saveMedication({
        id: medication.id,
        name: medication.name,
        genericName: medication.genericName,
        dosage: medication.dosage,
        manufacturer: medication.manufacturer,
        shape: medication.shape,
        color: medication.color,
        imprint: medication.imprint,
        scannedAt: new Date().toISOString(),
        imageUri,
        warnings: medication.warnings,
        sideEffects: medication.sideEffects,
      });

      await addScanToHistory({
        id: generateId(),
        medicationId: medication.id,
        medicationName: medication.name,
        scannedAt: new Date().toISOString(),
        imageUri,
        confidence: result.confidence,
        analysisMethod: result.analysisMethod,
        matchDetails: result.matchDetails,
      });

      await awardPoints("scan", medication.name);

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      navigation.navigate("ScanResult", { imageUri });
    } catch (error) {
      console.error("Error scanning pill:", error);
    } finally {
      setIsScanning(false);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setIsScanning(true);
      try {
        const imageUri = result.assets[0].uri;
        const analysisResult = await analyzePillImage(imageUri);

        if (!analysisResult.medication) {
          console.error("No medication identified from gallery image");
          return;
        }

        const medication = analysisResult.medication;

        await saveMedication({
          id: medication.id,
          name: medication.name,
          genericName: medication.genericName,
          dosage: medication.dosage,
          manufacturer: medication.manufacturer,
          shape: medication.shape,
          color: medication.color,
          imprint: medication.imprint,
          scannedAt: new Date().toISOString(),
          imageUri,
          warnings: medication.warnings,
          sideEffects: medication.sideEffects,
        });

        await addScanToHistory({
          id: generateId(),
          medicationId: medication.id,
          medicationName: medication.name,
          scannedAt: new Date().toISOString(),
          imageUri,
          confidence: analysisResult.confidence,
          analysisMethod: analysisResult.analysisMethod,
          matchDetails: analysisResult.matchDetails,
        });

        await awardPoints("scan", medication.name);

        navigation.navigate("ScanResult", { imageUri });
      } catch (error) {
        console.error("Error analyzing image:", error);
      } finally {
        setIsScanning(false);
      }
    }
  };

  const openSettings = async () => {
    try {
      await Linking.openSettings();
    } catch (error) {
      console.error("Could not open settings:", error);
    }
  };

  if (!permission) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={theme.primary} />
      </ThemedView>
    );
  }

  if (!permission.granted) {
    const canRetry = permission.canAskAgain;

    return (
      <ThemedView style={[styles.container, styles.permissionContainer]}>
        <View
          style={[
            styles.permissionIcon,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <Feather name="camera" size={48} color={theme.primary} />
        </View>
        <ThemedText type="h2" style={styles.permissionTitle}>
          {t.scanner.cameraPermission}
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.permissionText, { color: theme.textSecondary }]}
        >
          {language === "uz"
            ? "SentinelRX tabletkalarni skanerlash va AI tasvirini aniqlash uchun kameraga kirish huquqini talab qiladi"
            : language === "ru"
              ? "SentinelRX требует доступ к камере для сканирования и распознавания таблеток с помощью ИИ"
              : "SentinelRX needs camera access to scan and identify pills using AI image recognition"}
        </ThemedText>
        {canRetry ? (
          <Button onPress={requestPermission} style={styles.permissionButton}>
            {t.scanner.enableCamera}
          </Button>
        ) : Platform.OS !== "web" ? (
          <Button onPress={openSettings} style={styles.permissionButton}>
            {t.common.openSettings}
          </Button>
        ) : null}
        <Spacer height={Spacing.lg} />
        <Pressable onPress={handlePickImage}>
          <ThemedText type="link">
            {language === "uz"
              ? "Yoki galereyadan tanlang"
              : language === "ru"
                ? "Или выберите из галереи"
                : "Or choose from gallery"}
          </ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <View style={styles.container}>
      {Platform.OS === "web" ? (
        <ThemedView style={styles.webFallback}>
          <View
            style={[
              styles.permissionIcon,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <Feather name="camera" size={48} color={theme.primary} />
          </View>
          <ThemedText type="h3" style={styles.webTitle}>
            {t.scanner.title}
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.webText, { color: theme.textSecondary }]}
          >
            {t.scanner.webFallback}
          </ThemedText>
          <Spacer height={Spacing.xl} />
          <Button onPress={handlePickImage} style={styles.galleryButton}>
            {t.scanner.gallery}
          </Button>
          <Spacer height={Spacing.lg} />
          <Button
            onPress={handleCapture}
            variant="secondary"
            style={styles.galleryButton}
          >
            {t.scanner.simulateScan}
          </Button>
        </ThemedView>
      ) : (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          enableTorch={flashOn}
          barcodeScannerSettings={{
            barcodeTypes: [
              "qr",
              "datamatrix",
              "code128",
              "code39",
              "ean13",
              "ean8",
              "upc_a",
              "upc_e",
            ],
          }}
          onBarcodeScanned={
            scanMode === "barcode" ? handleBarcodeScanned : undefined
          }
        >
          <View style={[styles.overlay, { paddingTop: insets.top + 60 }]}>
            <View style={styles.modeSelector}>
              <Pressable
                onPress={() => setScanMode("pill")}
                style={[
                  styles.modeButton,
                  scanMode === "pill" && { backgroundColor: theme.primary },
                ]}
              >
                <Feather
                  name="disc"
                  size={16}
                  color={scanMode === "pill" ? "#FFF" : "rgba(255,255,255,0.5)"}
                />
                <ThemedText type="small" style={styles.modeText}>
                  {language === "uz"
                    ? "Tabletka"
                    : language === "ru"
                      ? "Таблетка"
                      : "Pill"}
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => setScanMode("barcode")}
                style={[
                  styles.modeButton,
                  scanMode === "barcode" && { backgroundColor: theme.primary },
                ]}
              >
                <Feather name="grid" size={16} color={scanMode === "barcode" ? "#FFF" : "rgba(255,255,255,0.5)"} />
                <ThemedText type="small" style={styles.modeText}>
                  {language === "uz"
                    ? "Shtrix-kod"
                    : language === "ru"
                      ? "Штрих-код"
                      : "Barcode"}
                </ThemedText>
              </Pressable>
            </View>

            <View style={styles.scannerFrame}>
              <View
                style={[
                  styles.corner,
                  styles.topLeft,
                  { borderColor: theme.primary },
                ]}
              />
              <View
                style={[
                  styles.corner,
                  styles.topRight,
                  { borderColor: theme.primary },
                ]}
              />
              <View
                style={[
                  styles.corner,
                  styles.bottomLeft,
                  { borderColor: theme.primary },
                ]}
              />
              <View
                style={[
                  styles.corner,
                  styles.bottomRight,
                  { borderColor: theme.primary },
                ]}
              />
            </View>
            <ThemedText type="body" style={styles.scanHint}>
              {scanMode === "pill"
                ? t.scanner.positionPill
                : language === "uz"
                  ? "Shtrix-kodni ramkaga joylashtiring"
                  : language === "ru"
                    ? "Расположите штрих-код в рамке"
                    : "Position barcode in frame"}
            </ThemedText>
            {isScanning ? (
              <View style={styles.scanningIndicator}>
                <ActivityIndicator color="#FFFFFF" />
                <ThemedText type="small" style={styles.scanningText}>
                  {t.scanner.scanning}
                </ThemedText>
              </View>
            ) : null}
          </View>

          <View
            style={[
              styles.controls,
              { paddingBottom: insets.bottom + Spacing["4xl"] + 60 },
            ]}
          >
            <Pressable
              onPress={handlePickImage}
              style={[
                styles.sideButton,
                { backgroundColor: "rgba(255,255,255,0.2)" },
              ]}
            >
              <Feather name="image" size={24} color="#FFFFFF" />
            </Pressable>

            <Pressable
              onPress={handleCapture}
              disabled={isScanning || scanMode === "barcode"}
              style={[
                styles.captureButton,
                {
                  backgroundColor:
                    scanMode === "barcode"
                      ? theme.textSecondary
                      : theme.primary,
                  opacity: isScanning ? 0.5 : 1,
                },
              ]}
            >
              {isScanning ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <View style={styles.captureInner} />
              )}
            </Pressable>

            <Pressable
              onPress={() => setFlashOn(!flashOn)}
              style={[
                styles.sideButton,
                {
                  backgroundColor: flashOn
                    ? theme.accent
                    : "rgba(255,255,255,0.2)",
                },
              ]}
            >
              <Feather
                name={flashOn ? "zap" : "zap-off"}
                size={24}
                color="#FFFFFF"
              />
            </Pressable>
          </View>
        </CameraView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permissionContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["2xl"],
  },
  permissionIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  permissionTitle: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  permissionText: {
    textAlign: "center",
    marginBottom: Spacing.xl,
    maxWidth: 300,
  },
  permissionButton: {
    minWidth: 200,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modeSelector: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: BorderRadius.lg,
    padding: Spacing.xs,
  },
  modeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  modeText: {
    color: "#FFFFFF",
  },
  scannerFrame: {
    width: 250,
    height: 250,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: BorderRadius.md,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: BorderRadius.md,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: BorderRadius.md,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: BorderRadius.md,
  },
  scanHint: {
    color: "#FFFFFF",
    marginTop: Spacing.xl,
    marginBottom: Spacing["4xl"] + 80,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  scanningIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  scanningText: {
    color: "#FFFFFF",
  },
  controls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing["3xl"],
  },
  sideButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
  },
  webFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["2xl"],
  },
  webTitle: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  webText: {
    textAlign: "center",
    maxWidth: 300,
  },
  galleryButton: {
    minWidth: 220,
  },
});
