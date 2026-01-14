import React, { useState, useEffect, useRef } from "react";
import { 
    View, 
    StyleSheet, 
    TextInput, 
    ScrollView, 
    TouchableOpacity, 
    KeyboardAvoidingView, 
    Platform, 
    ActivityIndicator,
    Alert
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from 'expo-speech';

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { useApp } from "@/contexts/AppContext"; // for global settings
import { getUserProfile, getScanHistory, UserProfile, ScanHistoryItem } from "@/utils/storage";
import { chatWithHealthAssistant } from "@/utils/drugDataService";

// --- Types ---
type Message = {
    id: string;
    text: string;
    sender: "user" | "ai";
    timestamp: Date;
};

export default function AIAssistantScreen() {
    const { theme, isDark } = useTheme();
    const scrollViewRef = useRef<ScrollView>(null);
    
    // State
    const [messages, setMessages] = useState<Message[]>([
        { 
            id: "welcome", 
            text: "Hello! I am Sentinel, your personal health companion. How can I help you today?", 
            sender: "ai", 
            timestamp: new Date() 
        }
    ]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([
        "Scan safety check",
        "Find a pharmacy", 
        "Understand my allergies",
        "Translate specific drug"
    ]);

    // Context Data
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);

    useEffect(() => {
        loadContext();
    }, []);

    const loadContext = async () => {
        const [profile, scans] = await Promise.all([
            getUserProfile(),
            getScanHistory()
        ]);
        setUserProfile(profile);
        setScanHistory(scans);
    };

    // --- Actions ---

    const handleSend = async (text: string = inputText) => {
        if (!text.trim()) return;

        // 1. Add User Message
        const userMsg: Message = { id: Date.now().toString(), text, sender: "user", timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInputText("");
        setIsLoading(true);

        // Scroll to bottom
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

        // 2. Prepare Context - Extract all required fields for the AI assistant
        const locationContext = "Uzbekistan"; // Mock for now, or hook into LocationContext if available
        
        const contextPayload = {
            profile: JSON.stringify(userProfile || {}),
            allergies: userProfile?.allergies || [],
            medications: scanHistory.slice(0, 10).map(scan => scan.medicationName), // Recent medications from scan history
            conditions: userProfile?.chronicConditions || [],
            recentScans: scanHistory.slice(0, 5).map(scan => scan.medicationName),
            language: userProfile?.language || "en",
            location: locationContext
        };

        // 3. Call AI
        const result = await chatWithHealthAssistant(text, contextPayload);
        setIsLoading(false);

        if (result && result.text) {
            const aiMsg: Message = { 
                id: (Date.now() + 1).toString(), 
                text: result.text, 
                sender: "ai", 
                timestamp: new Date() 
            };
            setMessages(prev => [...prev, aiMsg]);
            
            // Speak response (Voice Assistant Feature)
            // Only speak if length is reasonable to avoid annoyance
            if (result.text.length < 200) {
                Speech.speak(result.text, { language: userProfile?.language || 'en' });
            }

            if (result.suggestions && result.suggestions.length > 0) {
                setSuggestions(result.suggestions);
            }
        } else {
             const errorMsg: Message = { 
                id: (Date.now() + 1).toString(), 
                text: "I'm having trouble reaching the medical database. Please check your connection.", 
                sender: "ai", 
                timestamp: new Date() 
            };
            setMessages(prev => [...prev, errorMsg]);
        }
        
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    };

    return (
        <KeyboardAvoidingView 
            style={[styles.container, { backgroundColor: theme.backgroundRoot }]} 
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
            {/* Header */}
            <LinearGradient
                colors={isDark ? ['#0F172A', '#1E293B'] : ['#F0F9FF', '#E0F2FE']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View style={styles.botIcon}>
                         <Feather name="cpu" size={24} color={theme.primary} />
                    </View>
                    <View>
                        <ThemedText type="h4">Sentinel AI</ThemedText>
                        <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                            <View style={[styles.onlineDot, {backgroundColor: '#22C55E'}]} />
                            <ThemedText type="small" style={{color: theme.textSecondary}}>Online • Medical Assistant</ThemedText>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            {/* Chat Area */}
            <ScrollView 
                ref={scrollViewRef}
                contentContainerStyle={styles.chatScroll}
                keyboardShouldPersistTaps="handled"
            >
                {messages.map((msg) => (
                    <View 
                        key={msg.id} 
                        style={[
                            styles.messageBubble, 
                            msg.sender === "user" 
                                ? [styles.userBubble, { backgroundColor: theme.primary }] 
                                : [styles.aiBubble, { backgroundColor: theme.cardBackground }]
                        ]}
                    >
                        <ThemedText 
                            type="body" 
                            style={{ color: msg.sender === "user" ? '#FFF' : theme.text }}
                        >
                            {msg.text}
                        </ThemedText>
                        <ThemedText 
                            type="small" 
                            style={{ 
                                color: msg.sender === "user" ? 'rgba(255,255,255,0.7)' : theme.textSecondary,
                                alignSelf: 'flex-end',
                                marginTop: 4,
                                fontSize: 10
                            }}
                        >
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </ThemedText>
                    </View>
                ))}
                
                {isLoading && (
                    <View style={[styles.messageBubble, styles.aiBubble, { backgroundColor: theme.cardBackground, width: 60, alignItems: 'center' }]}>
                        <ActivityIndicator color={theme.primary} size="small" />
                    </View>
                )}
            </ScrollView>

            {/* Suggestions & Input - PREMIUM REDESIGN */}
            <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderTopColor: theme.border }]}>
                {/* Suggestions Chips - Enhanced */}
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={styles.chipsContainer}
                >
                    {suggestions.map((chip, index) => (
                        <TouchableOpacity 
                            key={index} 
                            style={[
                                styles.suggestionChip, 
                                { 
                                    backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
                                    borderColor: theme.primary + '40'
                                }
                            ]}
                            onPress={() => handleSend(chip)}
                            activeOpacity={0.7}
                        >
                            <Feather name="zap" size={12} color={theme.primary} style={{marginRight: 4}} />
                            <ThemedText type="small" style={{color: theme.primary, fontWeight: '600'}}>{chip}</ThemedText>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Premium Input Row */}
                <View style={[styles.inputWrapper, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                    {/* Attachment Button */}
                    <TouchableOpacity 
                        style={styles.attachButton}
                        onPress={() => Alert.alert("Coming Soon", "Image and file attachments coming in next update!")}
                    >
                        <Feather name="paperclip" size={20} color={theme.textSecondary} />
                    </TouchableOpacity>

                    {/* Text Input */}
                    <TextInput
                        style={[
                            styles.textInput, 
                            { 
                                color: isDark ? '#FFFFFF' : '#1F2937',
                                backgroundColor: 'transparent',
                            }
                        ]}
                        placeholder="Type your health question..."
                        placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                        value={inputText}
                        onChangeText={setInputText}
                        onSubmitEditing={() => handleSend()}
                        returnKeyType="send"
                        multiline
                        maxLength={500}
                        textAlignVertical="center"
                    />

                    {/* Voice/Send Button */}
                    <TouchableOpacity 
                        style={[
                            styles.sendButton, 
                            inputText.trim() 
                                ? { backgroundColor: theme.primary }
                                : { backgroundColor: isDark ? 'rgba(100,100,100,0.3)' : 'rgba(100,100,100,0.15)' }
                        ]}
                        onPress={() => inputText.trim() ? handleSend() : Alert.alert("Voice Input", "Hold to speak (coming soon)")}
                        activeOpacity={0.8}
                    >
                        <Feather 
                            name={inputText.trim() ? "send" : "mic"} 
                            size={18} 
                            color={inputText.trim() ? "#FFF" : theme.textSecondary} 
                        />
                    </TouchableOpacity>
                </View>

                {/* Character Count */}
                {inputText.length > 0 && (
                    <ThemedText type="small" style={[styles.charCount, { color: theme.textSecondary }]}>
                        {inputText.length}/500
                    </ThemedText>
                )}
            </View>

        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderBottomLeftRadius: BorderRadius.xl,
        borderBottomRightRadius: BorderRadius.xl,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
        zIndex: 10,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md
    },
    botIcon: {
        width: 44, 
        height: 44, 
        borderRadius: 22, 
        backgroundColor: 'rgba(37, 99, 235, 0.15)',
        alignItems: 'center', 
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(37, 99, 235, 0.3)',
    },
    onlineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    chatScroll: {
        padding: Spacing.lg,
        paddingBottom: 20
    },
    messageBubble: {
        maxWidth: '82%',
        padding: 14,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.md,
        ...Shadows.small,
    },
    userBubble: {
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
    },
    inputContainer: {
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.sm,
        paddingBottom: Platform.OS === 'ios' ? 34 : Spacing.md,
        borderTopWidth: 1,
    },
    chipsContainer: {
        paddingBottom: Spacing.sm,
        gap: 8,
    },
    suggestionChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 24,
        borderWidth: 1.5,
        paddingHorizontal: 6,
        paddingVertical: 4,
        minHeight: 48,
    },
    attachButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textInput: {
        flex: 1,
        fontSize: 15,
        paddingHorizontal: 8,
        paddingVertical: 8,
        maxHeight: 100,
        lineHeight: 20,
    },
    sendButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
    },
    charCount: {
        alignSelf: 'flex-end',
        marginTop: 4,
        marginRight: 8,
        fontSize: 11,
    }
});
