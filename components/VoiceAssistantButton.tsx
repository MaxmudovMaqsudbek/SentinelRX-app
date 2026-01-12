import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  StyleSheet,
  View,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  WithSpringConfig,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useTranslations } from "@/contexts/AppContext";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import {
  processVoiceQuery,
  speakText,
  stopSpeaking,
} from "@/utils/aiServices";
import { chatWithHealthAssistant, chatWithHealthAssistantAudio } from "@/utils/drugDataService";
import { getUserProfile, getScanHistory } from "@/utils/storage";
import { Audio } from 'expo-av';
// Using legacy import to avoid "Method readAsStringAsync is deprecated" error in SDK 54
import * as FileSystem from 'expo-file-system/legacy';

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.5,
  stiffness: 150,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const TAB_BAR_HEIGHT = 80;

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  usedLocalFallback?: boolean;
  suggestions?: string[];
  // Warning fields for allergy/interaction alerts
  isWarning?: boolean;
  warningType?: 'allergy' | 'interaction' | 'condition';
  warningSeverity?: 'low' | 'medium' | 'high';
  // Translation fields for "Translate for Doctor" feature
  translation?: {
    original: string;
    uzbek: string;
    russian: string;
    english: string;
  };
}

// 🌍 Translation Card Component (Translate for Doctor)
const TranslationCard = ({ 
  translation, 
  theme 
}: { 
  translation: Message['translation'], 
  theme: any 
}) => {
  if (!translation) return null;

  const languages = [
    { code: 'uz', flag: '🇺🇿', label: 'O\'zbekcha', text: translation.uzbek },
    { code: 'ru', flag: '🇷🇺', label: 'Русский', text: translation.russian },
    { code: 'en', flag: '🇬🇧', label: 'English', text: translation.english },
  ];

  const handleSpeak = async (text: string, langCode: string) => {
    try {
      await speakText(text, { language: langCode as 'en' | 'uz' | 'ru' });
    } catch (e) {
      console.log('[Translation] TTS error:', e);
    }
  };

  return (
    <View style={{
      backgroundColor: '#E8F5E9',
      borderRadius: 16,
      padding: 16,
      marginTop: 8,
      borderWidth: 2,
      borderColor: '#4CAF50'
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Feather name="globe" size={20} color="#4CAF50" />
        <ThemedText type="body" style={{ color: '#2E7D32', fontWeight: 'bold', marginLeft: 8 }}>
          🩺 Translate for Doctor
        </ThemedText>
      </View>
      
      <ThemedText type="small" style={{ color: '#666', marginBottom: 12, fontStyle: 'italic' }}>
        "{translation.original}"
      </ThemedText>

      {languages.map((lang) => (
        <View key={lang.code} style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          padding: 12,
          marginBottom: 8
        }}>
          <ThemedText type="body" style={{ fontSize: 24, marginRight: 12 }}>{lang.flag}</ThemedText>
          <View style={{ flex: 1 }}>
            <ThemedText type="caption" style={{ color: '#666' }}>{lang.label}</ThemedText>
            <ThemedText type="body" style={{ color: '#333', fontWeight: '500' }}>{lang.text}</ThemedText>
          </View>
          <Pressable 
            onPress={() => handleSpeak(lang.text, lang.code)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#4CAF50',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Feather name="volume-2" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      ))}
    </View>
  );
};

// 🚨 Emergency Mode Component (One-Tap Safety)
import { Linking } from 'react-native';

const EmergencyModeCard = ({ 
  allergies, 
  emergencyContact,
  theme,
  onClose
}: { 
  allergies: string[], 
  emergencyContact?: string,
  theme: any,
  onClose: () => void
}) => {
  const emergencyNumber = '103'; // Uzbekistan ambulance
  const policeNumber = '102';
  const fireNumber = '101';

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      zIndex: 1000
    }}>
      {/* Close Button */}
      <Pressable 
        onPress={onClose}
        style={{
          position: 'absolute',
          top: 60,
          right: 20,
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: 'rgba(255,255,255,0.2)',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Feather name="x" size={24} color="#FFFFFF" />
      </Pressable>

      {/* Emergency Header */}
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <View style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: '#FF3B30',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16
        }}>
          <Feather name="alert-circle" size={40} color="#FFFFFF" />
        </View>
        <ThemedText type="h1" style={{ color: '#FFFFFF', fontSize: 28, fontWeight: 'bold' }}>
          🚨 EMERGENCY MODE
        </ThemedText>
        <ThemedText type="body" style={{ color: '#FFFFFF', opacity: 0.8, marginTop: 4 }}>
          Tap to call emergency services
        </ThemedText>
      </View>

      {/* Emergency Call Buttons */}
      <View style={{ width: '100%', gap: 12 }}>
        <Pressable 
          onPress={() => handleCall(emergencyNumber)}
          style={{
            backgroundColor: '#FF3B30',
            borderRadius: 16,
            padding: 20,
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          <View style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: 'rgba(255,255,255,0.2)',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Feather name="phone-call" size={24} color="#FFFFFF" />
          </View>
          <View style={{ marginLeft: 16, flex: 1 }}>
            <ThemedText type="body" style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' }}>
              🚑 Ambulance
            </ThemedText>
            <ThemedText type="body" style={{ color: '#FFFFFF', opacity: 0.8 }}>
              Call {emergencyNumber}
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={24} color="#FFFFFF" />
        </Pressable>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable 
            onPress={() => handleCall(policeNumber)}
            style={{
              flex: 1,
              backgroundColor: '#007AFF',
              borderRadius: 16,
              padding: 16,
              alignItems: 'center'
            }}
          >
            <Feather name="shield" size={24} color="#FFFFFF" />
            <ThemedText type="small" style={{ color: '#FFFFFF', marginTop: 8, fontWeight: '600' }}>
              Police {policeNumber}
            </ThemedText>
          </Pressable>

          <Pressable 
            onPress={() => handleCall(fireNumber)}
            style={{
              flex: 1,
              backgroundColor: '#FF9500',
              borderRadius: 16,
              padding: 16,
              alignItems: 'center'
            }}
          >
            <Feather name="alert-triangle" size={24} color="#FFFFFF" />
            <ThemedText type="small" style={{ color: '#FFFFFF', marginTop: 8, fontWeight: '600' }}>
              Fire {fireNumber}
            </ThemedText>
          </Pressable>
        </View>

        {/* Emergency Contact */}
        {emergencyContact && (
          <Pressable 
            onPress={() => handleCall(emergencyContact)}
            style={{
              backgroundColor: '#34C759',
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <Feather name="user" size={24} color="#FFFFFF" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <ThemedText type="body" style={{ color: '#FFFFFF', fontWeight: '600' }}>
                Emergency Contact
              </ThemedText>
              <ThemedText type="small" style={{ color: '#FFFFFF', opacity: 0.8 }}>
                {emergencyContact}
              </ThemedText>
            </View>
            <Feather name="phone" size={20} color="#FFFFFF" />
          </Pressable>
        )}
      </View>

      {/* Allergy Alert Card */}
      {allergies.length > 0 && (
        <View style={{
          marginTop: 24,
          width: '100%',
          backgroundColor: '#FFEB3B',
          borderRadius: 16,
          padding: 16
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Feather name="alert-circle" size={20} color="#333" />
            <ThemedText type="body" style={{ color: '#333', fontWeight: 'bold', marginLeft: 8 }}>
              ⚠️ ALLERGY ALERT - SHOW TO DOCTOR
            </ThemedText>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {allergies.map((allergy, index) => (
              <View 
                key={index}
                style={{
                  backgroundColor: '#FF3B30',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16
                }}
              >
                <ThemedText type="body" style={{ color: '#FFFFFF', fontWeight: '600' }}>
                  {allergy}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Footer */}
      <ThemedText type="caption" style={{ color: '#FFFFFF', opacity: 0.5, marginTop: 24, textAlign: 'center' }}>
        Your location and allergy info will be shared with emergency services
      </ThemedText>
    </View>
  );
};

// Sub-component to safely use Hooks for animation
const WaveformBar = ({ index, theme }: { index: number, theme: any }) => {
    const animatedStyle = useAnimatedStyle(() => ({
        height: withRepeat(withSequence(withSpring(20 + Math.random() * 30), withSpring(10)), -1, true),
        opacity: withRepeat(withSequence(withSpring(1), withSpring(0.5)), -1, true),
        transform: [{ scaleY: withRepeat(withSequence(withSpring(1.5), withSpring(1)), -1, true) }]
    }));

    return (
        <Animated.View
            style={[{
                width: 6,
                backgroundColor: theme.primary,
                borderRadius: 3,
                marginHorizontal: 3,
            }, animatedStyle]}
        />
    );
};

// 🌟 INVESTOR-READY: Animated AI Orb (Siri-like)
type OrbState = 'idle' | 'listening' | 'processing' | 'speaking';

const AnimatedAIOrb = ({ 
    state, 
    theme, 
    onPress 
}: { 
    state: OrbState, 
    theme: any, 
    onPress: () => void 
}) => {
    // Core animations
    const pulseScale = useSharedValue(1);
    const glowOpacity = useSharedValue(0.3);
    const rotateValue = useSharedValue(0);
    const rippleScale = useSharedValue(0);
    const rippleOpacity = useSharedValue(0);

    // Idle: Gentle breathing animation
    useEffect(() => {
        if (state === 'idle') {
            pulseScale.value = withRepeat(
                withSequence(
                    withSpring(1.05, { damping: 8, stiffness: 80 }),
                    withSpring(1, { damping: 8, stiffness: 80 })
                ),
                -1,
                true
            );
            glowOpacity.value = withRepeat(
                withSequence(
                    withSpring(0.5, { damping: 15 }),
                    withSpring(0.3, { damping: 15 })
                ),
                -1,
                true
            );
            rotateValue.value = 0;
        }
    }, [state]);

    // Listening: Pulse outward with ripples
    useEffect(() => {
        if (state === 'listening') {
            pulseScale.value = withRepeat(
                withSequence(
                    withSpring(1.15, { damping: 6, stiffness: 100 }),
                    withSpring(1.05, { damping: 6, stiffness: 100 })
                ),
                -1,
                true
            );
            glowOpacity.value = withRepeat(
                withSequence(
                    withSpring(0.8, { damping: 10 }),
                    withSpring(0.4, { damping: 10 })
                ),
                -1,
                true
            );
            // Ripple effect
            rippleScale.value = withRepeat(
                withSequence(
                    withSpring(0, { duration: 0 }),
                    withSpring(2, { damping: 8, stiffness: 50 })
                ),
                -1,
                false
            );
            rippleOpacity.value = withRepeat(
                withSequence(
                    withSpring(0.6, { duration: 0 }),
                    withSpring(0, { damping: 8, stiffness: 50 })
                ),
                -1,
                false
            );
        }
    }, [state]);

    // Processing: Rotate and pulse
    useEffect(() => {
        if (state === 'processing') {
            pulseScale.value = withRepeat(
                withSequence(
                    withSpring(1.1, { damping: 12 }),
                    withSpring(0.95, { damping: 12 })
                ),
                -1,
                true
            );
            rotateValue.value = withRepeat(
                withSpring(360, { damping: 5, stiffness: 20 }),
                -1,
                false
            );
            glowOpacity.value = withRepeat(
                withSequence(
                    withSpring(0.9, { damping: 8 }),
                    withSpring(0.5, { damping: 8 })
                ),
                -1,
                true
            );
        }
    }, [state]);

    // Speaking: Energetic pulse
    useEffect(() => {
        if (state === 'speaking') {
            pulseScale.value = withRepeat(
                withSequence(
                    withSpring(1.2, { damping: 4, stiffness: 150 }),
                    withSpring(1, { damping: 4, stiffness: 150 })
                ),
                -1,
                true
            );
            glowOpacity.value = withRepeat(
                withSequence(
                    withSpring(1, { damping: 6 }),
                    withSpring(0.6, { damping: 6 })
                ),
                -1,
                true
            );
        }
    }, [state]);

    const orbStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: pulseScale.value },
            { rotate: `${rotateValue.value}deg` }
        ]
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
        transform: [{ scale: pulseScale.value * 1.3 }]
    }));

    const rippleStyle = useAnimatedStyle(() => ({
        opacity: rippleOpacity.value,
        transform: [{ scale: rippleScale.value }]
    }));

    // Colors based on state
    const getColors = () => {
        switch (state) {
            case 'idle': return { primary: theme.primary, glow: theme.primary };
            case 'listening': return { primary: '#4CD964', glow: '#34C759' }; // Green
            case 'processing': return { primary: '#5AC8FA', glow: '#007AFF' }; // Blue
            case 'speaking': return { primary: '#FF9500', glow: '#FF6B00' }; // Orange
        }
    };

    const colors = getColors();

    return (
        <Pressable onPress={onPress} style={{ alignItems: 'center', justifyContent: 'center' }}>
            {/* Ripple Effect (Listening) */}
            {state === 'listening' && (
                <Animated.View
                    style={[{
                        position: 'absolute',
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        borderWidth: 3,
                        borderColor: colors.glow,
                    }, rippleStyle]}
                />
            )}
            
            {/* Glow Layer */}
            <Animated.View
                style={[{
                    position: 'absolute',
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    backgroundColor: colors.glow,
                }, glowStyle]}
            />
            
            {/* Main Orb */}
            <Animated.View
                style={[{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: colors.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.5,
                    shadowRadius: 12,
                    elevation: 8,
                }, orbStyle]}
            >
                {/* Inner Icon */}
                {state === 'idle' && <Feather name="mic" size={32} color="#FFFFFF" />}
                {state === 'listening' && <Feather name="mic" size={32} color="#FFFFFF" />}
                {state === 'processing' && <Feather name="loader" size={32} color="#FFFFFF" />}
                {state === 'speaking' && <Feather name="volume-2" size={32} color="#FFFFFF" />}
            </Animated.View>
            
            {/* State Label */}
            <View style={{ marginTop: 12, alignItems: 'center' }}>
                <ThemedText type="caption" style={{ color: colors.primary, fontWeight: '600' }}>
                    {state === 'idle' && 'Tap to speak'}
                    {state === 'listening' && 'Listening...'}
                    {state === 'processing' && 'Thinking...'}
                    {state === 'speaking' && 'Speaking...'}
                </ThemedText>
            </View>
        </Pressable>
    );
};

export function VoiceAssistantButton() {
  const { theme } = useTheme();
  const { t, language: appLanguage } = useTranslations();
  const insets = useSafeAreaInsets();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(
    null,
  );
  const [language, setLanguage] = useState<"en" | "uz" | "ru">(appLanguage);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  // 🚨 Emergency Mode State
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [userAllergies, setUserAllergies] = useState<string[]>([]);

  useEffect(() => {
    setLanguage(appLanguage);
  }, [appLanguage]);

  // 🚨 Load user allergies when modal opens
  useEffect(() => {
    if (isModalVisible) {
      getUserProfile().then(profile => {
        if (profile?.allergies) {
          setUserAllergies(profile.allergies);
        }
      });
    }
  }, [isModalVisible]);

  // 🌟 Compute Orb State for animations
  const orbState: OrbState = speakingMessageId 
    ? 'speaking' 
    : isProcessing 
      ? 'processing' 
      : isListening 
        ? 'listening' 
        : 'idle';

  const isListeningRef = useRef(false);
  const micTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 2 - pulseScale.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const handlePress = () => {
    setIsModalVisible(true);
  };

  const handleSend = async () => {
    if (!inputText.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsProcessing(true);

    try {
      // 1. Gather FULL Context (Investor-Ready)
      const profile = await getUserProfile();
      const scanHistory = await getScanHistory();
      
      // Get medications from scan history (most recent 5)
      const recentMedications = scanHistory.slice(0, 5).map(s => s.medicationName);
      
      // Build detailed context for smart AI responses
      const context = {
          profile: profile ? `Name: ${profile.name || 'User'}, Age: ${profile.age || 'Unknown'}` : "No profile",
          allergies: profile?.allergies || [],
          medications: recentMedications, // From scan history
          conditions: profile?.chronicConditions || [],
          recentScans: recentMedications,
          language: language,
          location: "Uzbekistan"
      };

      console.log("[VoiceAssistant] Context:", context);

      // 2. Call AI with Full Context
      const response = await chatWithHealthAssistant(userMessage.text, context);

      if (response) {
          // Check for warnings (allergy/interaction alerts)
          if (response.warning) {
            // Add warning card message
            const warningMessage: Message = {
              id: (Date.now() + 1).toString(),
              text: `⚠️ **${response.warning.title}**\n\n${response.warning.message}${response.warning.alternative ? `\n\n💊 **Alternative:** ${response.warning.alternative}` : ''}\n\n🏥 Please consult your doctor.`,
              isUser: false,
              timestamp: new Date(),
              isWarning: true,
              warningType: response.warning.type,
              warningSeverity: response.warning.severity
            };
            setMessages((prev) => [...prev, warningMessage]);
          }

          const assistantMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: response.text,
            isUser: false,
            timestamp: new Date(),
            suggestions: response.suggestions,
            // 🌍 Add translation if present (Translate for Doctor feature)
            translation: response.translation || undefined
          };
          setMessages((prev) => [...prev, assistantMessage]);
          handleSpeakMessage(assistantMessage.id, response.text);
      } else {
         throw new Error("AI Failed");
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting to the Sentinel Network. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Real Audio Recording
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const startRecording = async () => {
    if (Platform.OS === 'web') {
        Alert.alert("Not Supported", "Voice recording is currently available only on mobile devices.");
        return;
    }

    try {
        const perm = await Audio.requestPermissionsAsync();
        if (perm.status !== "granted") {
            Alert.alert("Permission Needed", "Microphone permission is required for voice chat.");
            return;
        }

        await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
        });

        const { recording } = await Audio.Recording.createAsync(
            Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(recording);
        setIsListening(true);
        pulseScale.value = withRepeat(withSequence(withSpring(1.2), withSpring(1)), -1, true);
        
        // Timeout for auto-stop (60s limit - ample time)
        micTimeoutRef.current = setTimeout(stopRecordingAndProcess, 60000);

    } catch (err) {
        console.error("Failed to start recording", err);
        setIsListening(false);
    }
  };

  const cancelRecording = async () => {
      if (micTimeoutRef.current) {
          clearTimeout(micTimeoutRef.current);
          micTimeoutRef.current = null;
      }
      if (recording) {
          try {
              await recording.stopAndUnloadAsync();
          } catch (e) {
              // ignore
          }
          setRecording(null);
      }
      setIsListening(false);
      pulseScale.value = withSpring(1);
  };


  const stopRecordingAndProcess = async () => {
      // Clear timeout
      if (micTimeoutRef.current) {
          clearTimeout(micTimeoutRef.current);
          micTimeoutRef.current = null;
      }

      if (!recording) return;

      setIsListening(false);
      setIsProcessing(true);
      pulseScale.value = withSpring(1);

      try {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(null); // Reset

        if (!uri) throw new Error("No audio URI");

        // Add processing message
        const processingMessage: Message = {
            id: Date.now().toString(),
            text: "🎤 Processing your voice...",
            isUser: true,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, processingMessage]);

        // Gather FULL Context (same as text chat)
        const profile = await getUserProfile();
        const scanHistory = await getScanHistory();
        const recentMedications = scanHistory.slice(0, 5).map(s => s.medicationName);
        
        const context = {
            profile: profile ? `Name: ${profile.name || 'User'}, Age: ${profile.age || 'Unknown'}` : "No profile",
            allergies: profile?.allergies || [],
            medications: recentMedications,
            conditions: profile?.chronicConditions || [],
            recentScans: recentMedications,
            language: language,
            location: "Uzbekistan" 
        };

        // Send audio URI to Whisper + GPT pipeline
        const response = await chatWithHealthAssistantAudio(uri, context);

        if (response) {
            // Update user message with actual transcript
            setMessages(prev => prev.map(msg => 
                msg.id === processingMessage.id 
                    ? { ...msg, text: `🎤 "${response.transcript}"` }
                    : msg
            ));

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: response.text,
                isUser: false,
                timestamp: new Date(),
                suggestions: response.suggestions
            };
            setMessages(prev => [...prev, assistantMessage]);
            handleSpeakMessage(assistantMessage.id, response.text);
        } else {
             const errorMsg: Message = {
                id: Date.now().toString(),
                text: "I couldn't hear that clearly. Please try again.",
                isUser: false,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        }
      } catch (error) {
          console.error("Audio processing failed", error);
          const errorMsg: Message = {
            id: Date.now().toString(),
            text: "Audio processing failed. Please check internet.",
            isUser: false,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMsg]);
      } finally {
          setIsProcessing(false);
      }
  };

  const handleMicPress = () => {
    if (isListening) {
      stopRecordingAndProcess();
    } else {
      startRecording();
    }
  };

  const handleSpeakMessage = async (messageId: string, text: string) => {
    if (isSpeaking && speakingMessageId === messageId) {
      await stopSpeaking();
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      return;
    }

    if (isSpeaking) {
      await stopSpeaking();
    }

    setIsSpeaking(true);
    setSpeakingMessageId(messageId);

    await speakText(text, {
      language,
      rate: 0.9,
      onDone: () => {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      },
      onError: () => {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      },
    });
  };

  const languageLabels = {
    en: "EN",
    uz: "UZ",
    ru: "RU",
  };

  return (
    <>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityLabel="Open AI assistant"
        accessibilityRole="button"
        style={[
          styles.fab,
          {
            backgroundColor: theme.primary,
            bottom: TAB_BAR_HEIGHT + insets.bottom + Spacing.lg,
          },
          Shadows.glow,
          animatedButtonStyle,
        ]}
      >
        {/* AI Robot Icon - Modern Design */}
        <View style={styles.aiIconContainer}>
          {/* Robot head */}
          <View style={styles.robotHead}>
            <View style={styles.robotEyeLeft} />
            <View style={styles.robotEyeRight} />
          </View>
          {/* Neural network indicator */}
          <View style={styles.robotAntenna} />
        </View>
      </AnimatedPressable>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView
            style={[styles.modalContainer, { paddingBottom: insets.bottom }]}
          >
            <View style={styles.modalHeader}>
              <ThemedText type="h3">{t.voice.title}</ThemedText>
              <View style={styles.headerRight}>
                {/* 🚨 Emergency Button */}
                <Pressable
                  onPress={() => setIsEmergencyMode(true)}
                  style={{
                    backgroundColor: '#FF3B30',
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginRight: 8,
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}
                >
                  <Feather name="alert-circle" size={16} color="#FFFFFF" />
                  <ThemedText type="label" style={{ color: '#FFFFFF', marginLeft: 4, fontWeight: 'bold' }}>
                    SOS
                  </ThemedText>
                </Pressable>

                <Pressable
                  style={[
                    styles.languageButton,
                    { backgroundColor: theme.backgroundSecondary },
                  ]}
                  onPress={() => {
                    const langs: Array<"en" | "uz" | "ru"> = ["en", "uz", "ru"];
                    const currentIndex = langs.indexOf(language);
                    setLanguage(langs[(currentIndex + 1) % langs.length]);
                  }}
                >
                  <ThemedText type="label">
                    {languageLabels[language]}
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => setIsModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Feather name="x" size={24} color={theme.text} />
                </Pressable>
              </View>
            </View>

            {/* 🚨 Emergency Mode Overlay */}
            {isEmergencyMode && (
              <EmergencyModeCard 
                allergies={userAllergies}
                theme={theme}
                onClose={() => setIsEmergencyMode(false)}
              />
            )}

            <ScrollView
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
            >
              {messages.length === 0 ? (
                <View style={styles.emptyChat}>
                  <View
                    style={[
                      styles.emptyIcon,
                      { backgroundColor: theme.backgroundSecondary },
                    ]}
                  >
                    <Feather
                      name="message-circle"
                      size={32}
                      color={theme.primary}
                    />
                  </View>
                  <ThemedText
                    type="body"
                    style={[styles.emptyText, { color: theme.textSecondary }]}
                  >
                    {language === "uz"
                      ? "Dorilar, ta'sirlar yoki dorixonalar haqida so'rang"
                      : language === "ru"
                        ? "Спросите о лекарствах, взаимодействиях или аптеках"
                        : "Ask me about medications, interactions, or finding pharmacies"}
                  </ThemedText>
                </View>
              ) : (
                messages.map((message) => (
                  <View key={message.id}>
                    <View
                      style={[
                        styles.messageBubble,
                        message.isUser
                          ? [
                              styles.userBubble,
                              { backgroundColor: theme.primary },
                            ]
                          : message.isWarning
                          ? [
                              styles.assistantBubble,
                              { 
                                backgroundColor: message.warningSeverity === 'high' 
                                  ? '#FF3B30' 
                                  : message.warningSeverity === 'medium' 
                                    ? '#FF9500' 
                                    : '#FFCC00',
                                borderWidth: 2,
                                borderColor: message.warningSeverity === 'high' 
                                  ? '#CC0000' 
                                  : message.warningSeverity === 'medium' 
                                    ? '#CC7700' 
                                    : '#CC9900',
                              },
                            ]
                          : [
                              styles.assistantBubble,
                              { backgroundColor: theme.backgroundSecondary },
                            ],
                      ]}
                    >
                      {message.isWarning && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                          <Feather name="alert-triangle" size={20} color="#FFFFFF" />
                          <ThemedText type="body" style={{ color: '#FFFFFF', fontWeight: 'bold', marginLeft: 8 }}>
                            {message.warningType === 'allergy' ? '⚠️ ALLERGY ALERT' : 
                             message.warningType === 'interaction' ? '⚡ DRUG INTERACTION' : 
                             '🏥 HEALTH WARNING'}
                          </ThemedText>
                        </View>
                      )}
                      {/* Message Text - Full Width */}
                      <ThemedText
                        type="body"
                        style={[
                          message.isUser ? styles.userText : message.isWarning ? { color: '#FFFFFF' } : undefined,
                          { lineHeight: 22 }
                        ]}
                      >
                        {message.text}
                      </ThemedText>
                      
                      {/* Footer Row - Timestamp & Voice Button */}
                      {!message.isUser && (
                        <View style={{ 
                          flexDirection: 'row', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          marginTop: 10,
                          paddingTop: 8,
                          borderTopWidth: 1,
                          borderTopColor: theme.border + '30'
                        }}>
                          <ThemedText type="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </ThemedText>
                          <Pressable
                            onPress={() => handleSpeakMessage(message.id, message.text)}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              paddingVertical: 6,
                              paddingHorizontal: 12,
                              borderRadius: 16,
                              backgroundColor: speakingMessageId === message.id 
                                ? theme.primary 
                                : theme.backgroundTertiary,
                            }}
                          >
                            <Feather
                              name={speakingMessageId === message.id ? "volume-x" : "volume-2"}
                              size={14}
                              color={speakingMessageId === message.id ? "#FFFFFF" : theme.text}
                            />
                            <ThemedText 
                              type="caption" 
                              style={{ 
                                marginLeft: 6, 
                                color: speakingMessageId === message.id ? "#FFFFFF" : theme.text,
                                fontWeight: '600'
                              }}
                            >
                              {speakingMessageId === message.id ? "Stop" : "Listen"}
                            </ThemedText>
                          </Pressable>
                        </View>
                      )}
                    </View>
                    {!message.isUser && message.usedLocalFallback ? (
                      <View style={styles.fallbackBadge}>
                        <Feather
                          name="cpu"
                          size={10}
                          color={theme.textSecondary}
                        />
                        <ThemedText
                          type="caption"
                          style={{
                            color: theme.textSecondary,
                            marginLeft: 4,
                            fontSize: 10,
                          }}
                        >
                          On-device response
                        </ThemedText>
                      </View>
                    ) : null}
                    {/* 🌍 Translate for Doctor Card */}
                    {!message.isUser && message.translation && (
                      <TranslationCard translation={message.translation} theme={theme} />
                    )}
                  </View>
                ))
              )}
              {isProcessing ? (
                <View
                  style={[
                    styles.messageBubble,
                    styles.assistantBubble,
                    { backgroundColor: theme.backgroundSecondary },
                  ]}
                >
                  <ThemedText
                    type="body"
                    style={{ color: theme.textSecondary }}
                  >
                    Thinking...
                  </ThemedText>
                </View>
              ) : null}
            </ScrollView>

            {/* Suggestions Chips */}
            {messages.length > 0 && messages[messages.length - 1].suggestions && (
                <View style={{maxHeight: 50, marginBottom: 16}}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: 16, gap: 8}}>
                        {messages[messages.length - 1].suggestions?.map((chip, idx) => (
                            <TouchableOpacity 
                                key={idx} 
                                onPress={() => { setInputText(chip); handleSend(); }}
                                style={{
                                    backgroundColor: theme.backgroundTertiary, 
                                    paddingHorizontal: 16, 
                                    paddingVertical: 8, 
                                    borderRadius: 20,
                                    borderWidth: 1,
                                    borderColor: theme.border
                                }}
                            >
                                <ThemedText type="small" style={{color: theme.primary, fontWeight: '600'}}>{chip}</ThemedText>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Siri-Style Footer */}
            <View style={{paddingBottom: Spacing.xl, paddingHorizontal: Spacing.lg, alignItems: 'center'}}>
                 {/* Waveform / Mic Area */}
                 <View style={{height: 120, alignItems: 'center', justifyContent: 'center', width: '100%'}}>
                     {isListening ? (
                         <View style={{flexDirection: 'row', alignItems: 'center', gap: 24}}>
                             {/* Cancel Button */}
                             <Pressable 
                                onPress={cancelRecording}
                                style={{
                                    width: 48, height: 48, borderRadius: 24, 
                                    backgroundColor: theme.backgroundTertiary,
                                    alignItems: 'center', justifyContent: 'center'
                                }}
                             >
                                 <Feather name="x" size={24} color={theme.text} />
                             </Pressable>

                             <View style={{alignItems: 'center'}}>
                                 {/* Active Waveform */}
                                 <View style={{
                                     width: 80, height: 80, borderRadius: 40,
                                     backgroundColor: theme.backgroundTertiary,
                                     borderWidth: 2, borderColor: theme.error,
                                     alignItems: 'center', justifyContent: 'center',
                                     ...Shadows.glow
                                 }}>
                                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 4, height: 32}}>
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <WaveformBar key={i} index={i} theme={theme} />
                                        ))}
                                    </View>
                                 </View>
                                 <ThemedText type="label" style={{marginTop: 8, color: theme.error}}>Recording...</ThemedText>
                             </View>

                             {/* Stop/Send Button */}
                             <Pressable 
                                onPress={stopRecordingAndProcess}
                                style={{
                                    width: 48, height: 48, borderRadius: 24, 
                                    backgroundColor: theme.primary,
                                    alignItems: 'center', justifyContent: 'center',
                                    ...Shadows.medium
                                }}
                             >
                                 <Feather name="arrow-up" size={24} color="#FFF" />
                             </Pressable>
                         </View>
                     ) : (
                         /* 🌟 INVESTOR-READY: Animated AI Orb */
                         <AnimatedAIOrb 
                            state={orbState} 
                            theme={theme} 
                            onPress={startRecording}
                         />
                     )}
                 </View>

                {/* Text Input Toggle - FIXED FOR ANDROID VISIBILITY */}
                <View style={{width: '100%', marginTop: 8}}>
                    <TextInput
                        style={[styles.input, { 
                            backgroundColor: theme.cardBackground || '#FFFFFF', 
                            borderRadius: 24, 
                            paddingHorizontal: 20,
                            paddingVertical: 14,
                            textAlign: 'center',
                            color: theme.text || '#1F2937',
                            borderWidth: 1.5,
                            borderColor: theme.border || '#E5E7EB',
                            fontSize: 16,
                            minHeight: 50,
                            display: isListening ? 'none' : 'flex'
                        }]}
                        placeholder="Or type your question..."
                        placeholderTextColor={theme.textSecondary || '#9CA3AF'}
                        value={inputText}
                        onChangeText={setInputText}
                        onSubmitEditing={handleSend}
                        returnKeyType="send"
                    />
                     {!isListening && inputText.length > 0 && (
                         <TouchableOpacity 
                            onPress={handleSend}
                            style={{
                                position: 'absolute', 
                                right: 8, 
                                top: 8,
                                backgroundColor: theme.primary,
                                borderRadius: 20,
                                padding: 10,
                                ...Shadows.small
                            }}
                         >
                             <Feather name="send" size={18} color="#FFF" />
                         </TouchableOpacity>
                     )}
                </View>
            </View>

            {Platform.OS === "web" ? (
              <ThemedText
                type="caption"
                style={[styles.webNote, { color: theme.textSecondary }]}
              >
                Voice input works best in Expo Go on your device
              </ThemedText>
            ) : null}
          </ThemedView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  aiIconContainer: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  robotHead: {
    width: 22,
    height: 16,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  robotEyeLeft: {
    width: 5,
    height: 5,
    backgroundColor: "#004575",
    borderRadius: 2,
  },
  robotEyeRight: {
    width: 5,
    height: 5,
    backgroundColor: "#004575",
    borderRadius: 2,
  },
  robotAntenna: {
    position: "absolute",
    top: -4,
    width: 8,
    height: 8,
    backgroundColor: "#00A5B5",
    borderRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    height: "70%",
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.2)",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  languageButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  emptyChat: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["4xl"],
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  emptyText: {
    textAlign: "center",
    maxWidth: 250,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  userBubble: {
    alignSelf: "flex-end",
    borderBottomRightRadius: Spacing.xs,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: Spacing.xs,
  },
  userText: {
    color: "#FFFFFF",
  },
  speakButton: {
    position: "absolute",
    bottom: Spacing.xs,
    right: Spacing.xs,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    margin: Spacing.lg,
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  inputButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  webNote: {
    textAlign: "center",
    paddingBottom: Spacing.sm,
  },
  fallbackBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: Spacing.xs,
    marginLeft: Spacing.sm,
    opacity: 0.7,
  },
});
