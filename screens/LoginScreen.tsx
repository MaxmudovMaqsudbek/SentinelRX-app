import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { useApp } from "../contexts/AppContext";
import { signIn } from "../utils/supabase";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

// 🎨 Animated Logo Component
const AnimatedLogo = () => {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.3);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withSpring(1.05, { damping: 8 }),
        withSpring(1, { damping: 8 })
      ),
      -1,
      true
    );
    glow.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1500 }),
        withTiming(0.3, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  return (
    <View style={styles.logoContainer}>
      {/* Glow Layer */}
      <Animated.View style={[styles.logoGlow, glowStyle]} />
      
      {/* Main Logo */}
      <Animated.View style={[styles.logoInner, logoStyle]}>
        <Feather name="shield" size={48} color="#fff" />
      </Animated.View>
    </View>
  );
};

export default function LoginScreen({ navigation }: any) {
  const { login, themeMode, skipAuth } = useApp();
  const insets = useSafeAreaInsets();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      // 🔐 Supabase Authentication
      const { data, error } = await signIn(email.trim().toLowerCase(), password);
      
      if (error) {
        console.error("[Auth] Login error:", error.message);
        Alert.alert("Login Failed", error.message || "Invalid email or password");
        return;
      }
      
      if (data?.session) {
        // Success! AppContext's onAuthStateChange will handle the rest
        console.log("[Auth] Login successful:", data.user?.email);
        // Navigation will happen automatically when auth state changes
      } else {
        Alert.alert("Login Failed", "No session returned. Please try again.");
      }
    } catch (error: any) {
      console.error("[Auth] Login exception:", error);
      Alert.alert("Error", "Connection error. Please check your internet.");
    } finally {
      setLoading(false);
    }
  };

  // 🎯 Demo Mode for Investors
  const handleDemoMode = async () => {
    Alert.alert(
      "🎯 Demo Mode",
      "Enter the app without an account to explore features. Your data won't be saved.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Continue as Guest", 
          onPress: () => {
            if (skipAuth) {
              skipAuth();
            } else {
              Alert.alert("Demo Mode", "Use email: demo@sentinelrx.com / password: demo123");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Premium Gradient Background - Deep Ocean Theme */}
      <LinearGradient
        colors={["#0F172A", "#1E3A5F", "#004575", "#00A5B5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Decorative Circles */}
      <View style={[styles.decorCircle, styles.circle1]} />
      <View style={[styles.decorCircle, styles.circle2]} />
      <View style={[styles.decorCircle, styles.circle3]} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <View style={[styles.content, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}>
          
          {/* Animated Logo */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <AnimatedLogo />
          </Animated.View>

          {/* Title */}
          <Animated.View 
            entering={FadeInDown.delay(200).springify()}
            style={styles.header}
          >
            <Text style={styles.title}>SentinelRX</Text>
            <Text style={styles.tagline}>Your Personal Medication Guardian</Text>
          </Animated.View>

          {/* Glassmorphism Card */}
          <Animated.View entering={FadeInUp.delay(300).springify()}>
            <BlurView intensity={20} tint="dark" style={styles.glassCard}>
              <View style={styles.glassCardInner}>
                
                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <Feather name="mail" size={20} color="rgba(255,255,255,0.6)" />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <Feather name="lock" size={20} color="rgba(255,255,255,0.6)" />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Feather 
                      name={showPassword ? "eye" : "eye-off"} 
                      size={20} 
                      color="rgba(255,255,255,0.6)" 
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={styles.loginButton} 
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Sign in to your account"
                  accessibilityHint="Double tap to sign in"
                >
                  <LinearGradient
                    colors={["#00A5B5", "#004575"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.loginButtonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Text style={styles.loginButtonText}>Sign In</Text>
                        <Feather name="arrow-right" size={20} color="#fff" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Forgot Password */}
                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

              </View>
            </BlurView>
          </Animated.View>

          {/* Social Login Buttons */}
          <Animated.View 
            entering={FadeInUp.delay(400).springify()}
            style={styles.socialSection}
          >
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => Alert.alert("Coming Soon", "Google Sign-In will be available in a future update.")}
                accessibilityRole="button"
                accessibilityLabel="Sign in with Google"
              >
                <View style={styles.socialIconGoogle}>
                  <Text style={{ fontSize: 20, fontWeight: "700" }}>G</Text>
                </View>
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => Alert.alert("Coming Soon", "Phone Sign-In will be available in a future update.")}
                accessibilityRole="button"
                accessibilityLabel="Sign in with Phone"
              >
                <Feather name="smartphone" size={20} color="#fff" />
                <Text style={styles.socialButtonText}>Phone</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(500).springify()}>
            <TouchableOpacity 
              style={styles.demoButton}
              onPress={handleDemoMode}
              accessibilityRole="button"
              accessibilityLabel="Try demo mode"
              accessibilityHint="Enter the app as a guest to explore features"
            >
              <Feather name="play-circle" size={18} color="#00A5B5" />
              <Text style={styles.demoButtonText}>Try Demo Mode</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Sign Up Link */}
          <Animated.View 
            entering={FadeInUp.delay(600).springify()}
            style={styles.footer}
          >
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.linkText}>Sign Up</Text>
            </TouchableOpacity>
          </Animated.View>

        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  
  // Decorative Circles
  decorCircle: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.1,
  },
  circle1: {
    width: 300,
    height: 300,
    backgroundColor: "#e94560",
    top: -100,
    right: -100,
  },
  circle2: {
    width: 200,
    height: 200,
    backgroundColor: "#0f3460",
    bottom: 100,
    left: -80,
  },
  circle3: {
    width: 150,
    height: 150,
    backgroundColor: "#e94560",
    bottom: -50,
    right: 50,
  },

  // Logo
  logoContainer: {
    width: 100,
    height: 100,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  logoGlow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#e94560",
  },
  logoInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Header
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    marginTop: 8,
  },

  // Glass Card
  glassCard: {
    width: width - 48,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  glassCardInner: {
    padding: 24,
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  // Inputs
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    gap: 12,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },

  // Login Button
  loginButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
  },
  loginButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    gap: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  // Forgot Password
  forgotPassword: {
    alignSelf: "center",
    marginTop: 16,
  },
  forgotPasswordText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
  },

  // Social Section
  socialSection: {
    width: "100%",
    marginTop: 24,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  dividerText: {
    color: "rgba(255,255,255,0.5)",
    marginHorizontal: 16,
    fontSize: 12,
  },
  socialButtons: {
    flexDirection: "row",
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    gap: 8,
  },
  socialIconGoogle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  socialButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  // Demo Button
  demoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: "rgba(233, 69, 96, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(233, 69, 96, 0.3)",
    gap: 8,
  },
  demoButtonText: {
    color: "#e94560",
    fontSize: 14,
    fontWeight: "600",
  },

  // Footer
  footer: {
    flexDirection: "row",
    marginTop: 24,
    marginBottom: 40,
  },
  footerText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
  },
  linkText: {
    color: "#e94560",
    fontWeight: "700",
    fontSize: 14,
  },
});
