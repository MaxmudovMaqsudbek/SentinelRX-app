import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Alert } from 'react-native';

// Get Supabase configuration from multiple sources
const supabaseUrl = Constants.expoConfig?.extra?.SUPABASE_URL ||
    process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY ||
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Configuration status
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey &&
    supabaseUrl.includes('supabase.co') &&
    supabaseAnonKey.length > 20);

// 🔍 DEBUG: Log Supabase configuration status on startup
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('[Supabase] Configuration Check:');
console.log('[Supabase] URL:', supabaseUrl ?
    (supabaseUrl.includes('supabase.co') ? `✅ ${supabaseUrl.substring(0, 35)}...` : '❌ Invalid URL format') :
    '❌ MISSING');
console.log('[Supabase] Key:', supabaseAnonKey ?
    (supabaseAnonKey.length > 20 ? '✅ Configured' : '❌ Too short') :
    '❌ MISSING');
console.log('[Supabase] Status:', isSupabaseConfigured ? '✅ READY' : '❌ NOT CONFIGURED');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (!isSupabaseConfigured) {
    console.error('[Supabase] ⚠️  AUTHENTICATION WILL NOT WORK');
    console.error('[Supabase] Please configure your .env file with:');
    console.error('');
    console.error('  EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co');
    console.error('  EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key_here');
    console.error('');
    console.error('[Supabase] Get these from: Supabase Dashboard > Settings > API');
    console.error('[Supabase] After adding, restart Expo with: npx expo start --clear');
}

// Create Supabase client (will fail silently if not configured)
export const supabase: SupabaseClient = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key',
    {
        auth: {
            storage: AsyncStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
    }
);

// Helper to check and alert if not configured
const checkConfig = () => {
    if (!isSupabaseConfigured) {
        Alert.alert(
            '⚙️ Setup Required',
            'Authentication is not configured.\n\nPlease set up Supabase:\n1. Create a Supabase project\n2. Add credentials to .env file\n3. Restart Expo with --clear\n\nSee .env.example for details.',
            [{ text: 'OK' }]
        );
        return false;
    }
    return true;
};

// Sign Up
export async function signUp(email: string, password: string, fullName?: string) {
    if (!checkConfig()) {
        return { data: null, error: { message: 'Supabase not configured. Check .env file.' } };
    }

    console.log('[Auth] Attempting sign up for:', email);

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: fullName ? {
                data: { full_name: fullName }
            } : undefined
        });

        if (error) {
            console.error('[Auth] Sign up error:', error.message);
        } else {
            console.log('[Auth] Sign up successful:', data.user?.email);
        }

        return { data, error };
    } catch (e: any) {
        console.error('[Auth] Sign up exception:', e);
        return { data: null, error: { message: e.message || 'Connection error' } };
    }
}

// Sign In
export async function signIn(email: string, password: string) {
    if (!checkConfig()) {
        return { data: null, error: { message: 'Supabase not configured. Check .env file.' } };
    }

    console.log('[Auth] Attempting sign in for:', email);

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('[Auth] Sign in error:', error.message);
        } else {
            console.log('[Auth] Sign in successful:', data.user?.email);
        }

        return { data, error };
    } catch (e: any) {
        console.error('[Auth] Sign in exception:', e);
        return { data: null, error: { message: e.message || 'Connection error' } };
    }
}

// Sign Out
export async function signOut() {
    console.log('[Auth] Signing out...');

    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('[Auth] Sign out error:', error.message);
        } else {
            console.log('[Auth] Signed out successfully');
        }
        return { error };
    } catch (e: any) {
        console.error('[Auth] Sign out exception:', e);
        return { error: { message: e.message || 'Sign out failed' } };
    }
}

// Get Current User
export async function getCurrentUser() {
    if (!isSupabaseConfigured) return null;

    try {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    } catch (e) {
        console.error('[Auth] Get user error:', e);
        return null;
    }
}

// Get Profile
export async function getProfile(userId: string) {
    if (!isSupabaseConfigured) {
        return { data: null, error: { message: 'Supabase not configured' } };
    }

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        return { data, error };
    } catch (e: any) {
        console.error('[Auth] Get profile error:', e);
        return { data: null, error: { message: e.message } };
    }
}