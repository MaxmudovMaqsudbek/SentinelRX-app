import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useColorScheme } from "react-native";
import {
  getUserProfile,
  getSettings,
  saveSettings,
  UserProfile,
  Settings,
  setCurrentUserId,
} from "@/utils/storage";
import { setAuthToken, authApi, UserProfileResponse } from "@/utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTranslations, Language } from "@/utils/i18n";
import { checkBackendHealth, BackendStatus } from "@/utils/aiServices";
import { supabase, signOut as supabaseSignOut, getProfile, isSupabaseConfigured } from "@/utils/supabase";
import { getProfileFromSupabase, createProfile } from "@/utils/supabaseData";
import { syncOnLogin } from "@/utils/dataSyncService";
import { Session, User } from "@supabase/supabase-js";


type ThemeMode = "light" | "dark";

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translations: ReturnType<typeof getTranslations>;
  themeMode: ThemeMode;
  setThemeMode: (mode: "light" | "dark" | "system") => void;
  themeSetting: "light" | "dark" | "system";
  isLoading: boolean;
  backendStatus: BackendStatus;
  user: UserProfileResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  login: (token: string, user: UserProfileResponse) => Promise<void>;
  logout: () => Promise<void>;
  skipAuth: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [language, setLanguageState] = useState<Language>("en");
  const [themeSetting, setThemeSetting] = useState<"light" | "dark" | "system">("system");
  const [isLoading, setIsLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("simulated");
  
  // Auth State
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfileResponse | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    loadSettings();
    checkBackend();
    
    // 🔐 Supabase Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[Auth] State changed:", event, session?.user?.email);
        
        if (session?.user) {
          // Build initial profile from auth metadata
          let userProfile: UserProfileResponse = {
            id: session.user.id,
            email: session.user.email || "",
            full_name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
            language: "en",
            is_active: true,
            is_verified: !!session.user.email_confirmed_at,
          };
          
          // 🗄️ Try to get profile from Supabase database for more accurate data
          try {
            const { data: dbProfile, error } = await getProfileFromSupabase(session.user.id);
            
            if (dbProfile && !error) {
              console.log("[Auth] Loaded profile from database:", dbProfile.full_name);
              userProfile = {
                ...userProfile,
                full_name: dbProfile.full_name || userProfile.full_name,
                language: (dbProfile.language as "en" | "uz" | "ru") || "en",
              };
            } else if (error) {
              console.log("[Auth] No profile in database, creating one...");
              // Profile doesn't exist, create it
              await createProfile(
                session.user.id,
                session.user.email || "",
                session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User"
              );
            }
          } catch (e) {
            console.warn("[Auth] Could not fetch profile from database:", e);
          }
          
          setToken(session.access_token);
          setUser(userProfile);
          setAuthToken(session.access_token);
          setIsGuest(false);
          
          // 🔐 Set user ID for user-scoped storage
          setCurrentUserId(session.user.id);
          
          // Persist
          await AsyncStorage.setItem("auth_token", session.access_token);
          await AsyncStorage.setItem("auth_user", JSON.stringify(userProfile));
          
          // 🔄 Sync all user data from cloud to local
          console.log("[Auth] Starting data sync from cloud...");
          await syncOnLogin(session.user.id);
          console.log("[Auth] Data sync complete!");
        } else if (event === "SIGNED_OUT") {
          // User logged out
          setToken(null);
          setUser(null);
          setAuthToken(null);
          setCurrentUserId(null); // Clear user ID for storage isolation
          await AsyncStorage.removeItem("auth_token");
          await AsyncStorage.removeItem("auth_user");
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkBackend = async () => {
    const status = await checkBackendHealth();
    setBackendStatus(status);
  };

  const loadSettings = async () => {
    try {
      // 1. Load Settings & Profile
      const [settings, profile] = await Promise.all([
        getSettings(),
        getUserProfile(),
      ]);
      setThemeSetting(settings.theme);
      setLanguageState(profile.language);

      // 2. Load Auth Token
      const savedToken = await AsyncStorage.getItem("auth_token");
      const savedUser = await AsyncStorage.getItem("auth_user");

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setAuthToken(savedToken); // Inject into API client
      }
    } catch (error) {
      console.error("Error loading app settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    // Optionally save language to storage here if needed
    // const profile = await getUserProfile();
    // await saveUserProfile({ ...profile, language: lang });
  };

  const setThemeMode = async (mode: "light" | "dark" | "system") => {
    setThemeSetting(mode);
    const settings = await getSettings();
    await saveSettings({ ...settings, theme: mode });
  };

  const login = async (newToken: string, newUser: UserProfileResponse) => {
    // This is called after successful Supabase login
    setToken(newToken);
    setUser(newUser);
    setAuthToken(newToken);
    setIsGuest(false);
    await AsyncStorage.setItem("auth_token", newToken);
    await AsyncStorage.setItem("auth_user", JSON.stringify(newUser));
  };

  const logout = async () => {
    try {
      // Sign out from Supabase
      await supabaseSignOut();
    } catch (e) {
      console.warn("Supabase logout failed", e);
    }
    
    // Clear local state
    setToken(null);
    setUser(null);
    setAuthToken(null);
    setIsGuest(false);
    await AsyncStorage.removeItem("auth_token");
    await AsyncStorage.removeItem("auth_user");
    await AsyncStorage.removeItem("is_guest");
  };

  // 🎯 Skip Auth for Demo Mode
  const skipAuth = async () => {
    setIsGuest(true);
    await AsyncStorage.setItem("is_guest", "true");
  };

  // Computed: Is user authenticated (logged in OR guest)
  const isAuthenticated = !!token || isGuest;

  const computedTheme: ThemeMode = 
    themeSetting === "system" 
      ? (systemColorScheme === "dark" ? "dark" : "light")
      : themeSetting;

  const translations = getTranslations(language);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        translations,
        themeMode: computedTheme,
        setThemeMode,
        themeSetting,
        isLoading,
        backendStatus,
        user,
        token,
        isAuthenticated,
        isGuest,
        login,
        logout,
        skipAuth,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

export function useTranslations() {
  const { translations, language } = useApp();
  return { t: translations, language };
}
