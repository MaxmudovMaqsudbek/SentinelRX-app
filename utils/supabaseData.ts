/**
 * 🗄️ Supabase Data Service
 * Handles all Supabase database operations for user data
 */

import { supabase, isSupabaseConfigured } from './supabase';

// ============================================
// Types matching Supabase schema
// ============================================

export interface SupabaseProfile {
    id: string;
    email: string | null;
    full_name: string | null;
    avatar_url: string | null;
    language: string;
    is_premium: boolean;
    created_at: string;
    updated_at: string;
}

export interface SupabaseHealthProfile {
    id: string;
    user_id: string;
    age: number | null;
    blood_type: string | null;
    weight: number | null;
    allergies: string[];
    conditions: string[];
    updated_at: string;
}

export interface SupabaseGamification {
    id: string;
    user_id: string;
    points: number;
    level: number;
    streak: number;
    badges: string[];
    updated_at: string;
}

export interface SupabaseMedication {
    id: string;
    user_id: string;
    name: string;
    dosage: string | null;
    frequency: string | null;
    time_of_day: string | null;
    notes: string | null;
    created_at: string;
}

export interface SupabaseScanHistory {
    id: string;
    user_id: string;
    medication_name: string;
    image_url: string | null;
    safety_score: number | null;
    interactions_found: number;
    scanned_at: string;
}

export interface SupabaseReminder {
    id: string;
    user_id: string;
    medication_id: string;
    medication_name: string;
    dosage: string | null;
    time: string;
    frequency: string;
    days_of_week: number[] | null;
    is_enabled: boolean;
    last_taken: string | null;
    taken_dates: string[];
    created_at: string;
}

export interface SupabaseFamilyMember {
    id: string;
    user_id: string;
    name: string;
    relationship: string | null;
    invite_code: string | null;
    is_connected: boolean;
    adherence_percentage: number;
    created_at: string;
}

// ============================================
// Profile Operations
// ============================================

/**
 * Create a new user profile in Supabase
 * Called after successful registration
 */
export async function createProfile(
    userId: string,
    email: string,
    fullName: string
): Promise<{ data: SupabaseProfile | null; error: any }> {
    if (!isSupabaseConfigured) {
        console.log('[SupabaseData] Not configured, skipping profile creation');
        return { data: null, error: { message: 'Supabase not configured' } };
    }

    console.log('[SupabaseData] Creating profile for:', email);

    try {
        // First, check if profile already exists (trigger may have created it)
        const { data: existing } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (existing) {
            console.log('[SupabaseData] Profile already exists, updating...');
            // Update existing profile with full_name if missing
            const { data, error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName || existing.full_name,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select()
                .single();

            return { data, error };
        }

        // Create new profile
        const { data, error } = await supabase
            .from('profiles')
            .insert({
                id: userId,
                email: email,
                full_name: fullName,
                language: 'en',
                is_premium: false,
            })
            .select()
            .single();

        if (error) {
            console.error('[SupabaseData] Profile creation error:', error.message);
        } else {
            console.log('[SupabaseData] Profile created successfully:', data?.id);
        }

        return { data, error };
    } catch (e: any) {
        console.error('[SupabaseData] Profile creation exception:', e);
        return { data: null, error: { message: e.message } };
    }
}

/**
 * Get user profile from Supabase
 */
export async function getProfileFromSupabase(
    userId: string
): Promise<{ data: SupabaseProfile | null; error: any }> {
    if (!isSupabaseConfigured) {
        return { data: null, error: { message: 'Supabase not configured' } };
    }

    console.log('[SupabaseData] Fetching profile for user:', userId);

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('[SupabaseData] Get profile error:', error.message);
        } else {
            console.log('[SupabaseData] Profile fetched:', data?.full_name);
        }

        return { data, error };
    } catch (e: any) {
        console.error('[SupabaseData] Get profile exception:', e);
        return { data: null, error: { message: e.message } };
    }
}

/**
 * Update user profile in Supabase
 */
export async function updateProfile(
    userId: string,
    updates: Partial<Pick<SupabaseProfile, 'full_name' | 'avatar_url' | 'language' | 'is_premium'>>
): Promise<{ data: SupabaseProfile | null; error: any }> {
    if (!isSupabaseConfigured) {
        return { data: null, error: { message: 'Supabase not configured' } };
    }

    console.log('[SupabaseData] Updating profile for user:', userId);

    try {
        const { data, error } = await supabase
            .from('profiles')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.error('[SupabaseData] Update profile error:', error.message);
        } else {
            console.log('[SupabaseData] Profile updated successfully');
        }

        return { data, error };
    } catch (e: any) {
        console.error('[SupabaseData] Update profile exception:', e);
        return { data: null, error: { message: e.message } };
    }
}

// ============================================
// Gamification Operations
// ============================================

/**
 * Get or create gamification data for user
 */
export async function getGamification(
    userId: string
): Promise<{ data: SupabaseGamification | null; error: any }> {
    if (!isSupabaseConfigured) {
        return { data: null, error: { message: 'Supabase not configured' } };
    }

    try {
        // Try to get existing
        let { data, error } = await supabase
            .from('gamification')
            .select('*')
            .eq('user_id', userId)
            .single();

        // If not found, create it
        if (error && error.code === 'PGRST116') {
            const { data: newData, error: insertError } = await supabase
                .from('gamification')
                .insert({
                    user_id: userId,
                    points: 0,
                    level: 1,
                    streak: 0,
                    badges: [],
                })
                .select()
                .single();

            return { data: newData, error: insertError };
        }

        return { data, error };
    } catch (e: any) {
        console.error('[SupabaseData] Get gamification exception:', e);
        return { data: null, error: { message: e.message } };
    }
}

/**
 * Update gamification data
 */
export async function updateGamification(
    userId: string,
    updates: Partial<Pick<SupabaseGamification, 'points' | 'level' | 'streak' | 'badges'>>
): Promise<{ data: SupabaseGamification | null; error: any }> {
    if (!isSupabaseConfigured) {
        return { data: null, error: { message: 'Supabase not configured' } };
    }

    try {
        const { data, error } = await supabase
            .from('gamification')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId)
            .select()
            .single();

        return { data, error };
    } catch (e: any) {
        console.error('[SupabaseData] Update gamification exception:', e);
        return { data: null, error: { message: e.message } };
    }
}

// ============================================
// Scan History Operations
// ============================================

/**
 * Add a scan to history in Supabase
 */
export async function addScanToSupabase(
    userId: string,
    medicationName: string,
    safetyScore?: number,
    interactionsFound?: number,
    imageUrl?: string
): Promise<{ data: SupabaseScanHistory | null; error: any }> {
    if (!isSupabaseConfigured) {
        return { data: null, error: { message: 'Supabase not configured' } };
    }

    try {
        const { data, error } = await supabase
            .from('scan_history')
            .insert({
                user_id: userId,
                medication_name: medicationName,
                safety_score: safetyScore || null,
                interactions_found: interactionsFound || 0,
                image_url: imageUrl || null,
            })
            .select()
            .single();

        console.log('[SupabaseData] Scan saved:', medicationName);
        return { data, error };
    } catch (e: any) {
        console.error('[SupabaseData] Add scan exception:', e);
        return { data: null, error: { message: e.message } };
    }
}

/**
 * Get scan history from Supabase
 */
export async function getScanHistory(
    userId: string,
    limit: number = 50
): Promise<{ data: SupabaseScanHistory[] | null; error: any }> {
    if (!isSupabaseConfigured) {
        return { data: null, error: { message: 'Supabase not configured' } };
    }

    try {
        const { data, error } = await supabase
            .from('scan_history')
            .select('*')
            .eq('user_id', userId)
            .order('scanned_at', { ascending: false })
            .limit(limit);

        return { data, error };
    } catch (e: any) {
        console.error('[SupabaseData] Get scan history exception:', e);
        return { data: null, error: { message: e.message } };
    }
}

// ============================================
// Medication Operations
// ============================================

/**
 * Save medication to Supabase
 */
export async function saveMedicationToSupabase(
    userId: string,
    name: string,
    dosage?: string,
    frequency?: string,
    timeOfDay?: string,
    notes?: string
): Promise<{ data: SupabaseMedication | null; error: any }> {
    if (!isSupabaseConfigured) {
        return { data: null, error: { message: 'Supabase not configured' } };
    }

    try {
        const { data, error } = await supabase
            .from('user_medications')
            .insert({
                user_id: userId,
                name,
                dosage: dosage || null,
                frequency: frequency || null,
                time_of_day: timeOfDay || null,
                notes: notes || null,
            })
            .select()
            .single();

        console.log('[SupabaseData] Medication saved:', name);
        return { data, error };
    } catch (e: any) {
        console.error('[SupabaseData] Save medication exception:', e);
        return { data: null, error: { message: e.message } };
    }
}

/**
 * Get user's medications from Supabase
 */
export async function getMedications(
    userId: string
): Promise<{ data: SupabaseMedication[] | null; error: any }> {
    if (!isSupabaseConfigured) {
        return { data: null, error: { message: 'Supabase not configured' } };
    }

    try {
        const { data, error } = await supabase
            .from('user_medications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        return { data, error };
    } catch (e: any) {
        console.error('[SupabaseData] Get medications exception:', e);
        return { data: null, error: { message: e.message } };
    }
}

/**
 * Delete medication from Supabase
 */
export async function deleteMedication(
    medicationId: string
): Promise<{ error: any }> {
    if (!isSupabaseConfigured) {
        return { error: { message: 'Supabase not configured' } };
    }

    try {
        const { error } = await supabase
            .from('user_medications')
            .delete()
            .eq('id', medicationId);

        return { error };
    } catch (e: any) {
        console.error('[SupabaseData] Delete medication exception:', e);
        return { error: { message: e.message } };
    }
}

// ============================================
// Reminder Operations
// ============================================

/**
 * Save reminder to Supabase
 */
export async function saveReminderToSupabase(
    userId: string,
    reminder: {
        medication_id: string;
        medication_name: string;
        dosage?: string;
        time: string;
        frequency?: string;
        days_of_week?: number[];
        is_enabled?: boolean;
    }
): Promise<{ data: SupabaseReminder | null; error: any }> {
    if (!isSupabaseConfigured) {
        return { data: null, error: { message: 'Supabase not configured' } };
    }

    try {
        const { data, error } = await supabase
            .from('reminders')
            .insert({
                user_id: userId,
                medication_id: reminder.medication_id,
                medication_name: reminder.medication_name,
                dosage: reminder.dosage || null,
                time: reminder.time,
                frequency: reminder.frequency || 'daily',
                days_of_week: reminder.days_of_week || null,
                is_enabled: reminder.is_enabled !== false,
                taken_dates: [],
            })
            .select()
            .single();

        console.log('[SupabaseData] Reminder saved:', reminder.medication_name);
        return { data, error };
    } catch (e: any) {
        console.error('[SupabaseData] Save reminder exception:', e);
        return { data: null, error: { message: e.message } };
    }
}

/**
 * Get user's reminders from Supabase
 */
export async function getRemindersFromSupabase(
    userId: string
): Promise<{ data: SupabaseReminder[] | null; error: any }> {
    if (!isSupabaseConfigured) {
        return { data: null, error: { message: 'Supabase not configured' } };
    }

    try {
        const { data, error } = await supabase
            .from('reminders')
            .select('*')
            .eq('user_id', userId)
            .order('time', { ascending: true });

        console.log('[SupabaseData] Fetched', data?.length || 0, 'reminders');
        return { data, error };
    } catch (e: any) {
        console.error('[SupabaseData] Get reminders exception:', e);
        return { data: null, error: { message: e.message } };
    }
}

/**
 * Update reminder in Supabase
 */
export async function updateReminderInSupabase(
    reminderId: string,
    updates: Partial<Pick<SupabaseReminder, 'is_enabled' | 'last_taken' | 'taken_dates'>>
): Promise<{ data: SupabaseReminder | null; error: any }> {
    if (!isSupabaseConfigured) {
        return { data: null, error: { message: 'Supabase not configured' } };
    }

    try {
        const { data, error } = await supabase
            .from('reminders')
            .update(updates)
            .eq('id', reminderId)
            .select()
            .single();

        return { data, error };
    } catch (e: any) {
        console.error('[SupabaseData] Update reminder exception:', e);
        return { data: null, error: { message: e.message } };
    }
}

/**
 * Delete reminder from Supabase
 */
export async function deleteReminderFromSupabase(
    reminderId: string
): Promise<{ error: any }> {
    if (!isSupabaseConfigured) {
        return { error: { message: 'Supabase not configured' } };
    }

    try {
        const { error } = await supabase
            .from('reminders')
            .delete()
            .eq('id', reminderId);

        return { error };
    } catch (e: any) {
        console.error('[SupabaseData] Delete reminder exception:', e);
        return { error: { message: e.message } };
    }
}

// ============================================
// Family Member Operations
// ============================================

/**
 * Save family member to Supabase
 */
export async function saveFamilyMemberToSupabase(
    userId: string,
    member: {
        name: string;
        relationship?: string;
        invite_code?: string;
    }
): Promise<{ data: SupabaseFamilyMember | null; error: any }> {
    if (!isSupabaseConfigured) {
        return { data: null, error: { message: 'Supabase not configured' } };
    }

    try {
        // Generate invite code if not provided
        const inviteCode = member.invite_code || Math.random().toString(36).substring(2, 8).toUpperCase();

        const { data, error } = await supabase
            .from('family_members')
            .insert({
                user_id: userId,
                name: member.name,
                relationship: member.relationship || null,
                invite_code: inviteCode,
                is_connected: false,
                adherence_percentage: 0,
            })
            .select()
            .single();

        console.log('[SupabaseData] Family member saved:', member.name);
        return { data, error };
    } catch (e: any) {
        console.error('[SupabaseData] Save family member exception:', e);
        return { data: null, error: { message: e.message } };
    }
}

/**
 * Get user's family members from Supabase
 */
export async function getFamilyMembersFromSupabase(
    userId: string
): Promise<{ data: SupabaseFamilyMember[] | null; error: any }> {
    if (!isSupabaseConfigured) {
        return { data: null, error: { message: 'Supabase not configured' } };
    }

    try {
        const { data, error } = await supabase
            .from('family_members')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        console.log('[SupabaseData] Fetched', data?.length || 0, 'family members');
        return { data, error };
    } catch (e: any) {
        console.error('[SupabaseData] Get family members exception:', e);
        return { data: null, error: { message: e.message } };
    }
}

/**
 * Update family member in Supabase
 */
export async function updateFamilyMemberInSupabase(
    memberId: string,
    updates: Partial<Pick<SupabaseFamilyMember, 'name' | 'relationship' | 'is_connected' | 'adherence_percentage'>>
): Promise<{ data: SupabaseFamilyMember | null; error: any }> {
    if (!isSupabaseConfigured) {
        return { data: null, error: { message: 'Supabase not configured' } };
    }

    try {
        const { data, error } = await supabase
            .from('family_members')
            .update(updates)
            .eq('id', memberId)
            .select()
            .single();

        return { data, error };
    } catch (e: any) {
        console.error('[SupabaseData] Update family member exception:', e);
        return { data: null, error: { message: e.message } };
    }
}

/**
 * Delete family member from Supabase
 */
export async function deleteFamilyMemberFromSupabase(
    memberId: string
): Promise<{ error: any }> {
    if (!isSupabaseConfigured) {
        return { error: { message: 'Supabase not configured' } };
    }

    try {
        const { error } = await supabase
            .from('family_members')
            .delete()
            .eq('id', memberId);

        return { error };
    } catch (e: any) {
        console.error('[SupabaseData] Delete family member exception:', e);
        return { error: { message: e.message } };
    }
}

// ============================================
// Health Profile Operations
// ============================================

/**
 * Save or update health profile (allergies, conditions) to Supabase
 */
export async function saveHealthProfileToSupabase(
    userId: string,
    healthData: {
        age?: number;
        blood_type?: string;
        weight?: number;
        allergies?: string[];
        conditions?: string[];
    }
): Promise<{ data: SupabaseHealthProfile | null; error: any }> {
    if (!isSupabaseConfigured) {
        return { data: null, error: { message: 'Supabase not configured' } };
    }

    try {
        // Try to update first (upsert)
        const { data: existing } = await supabase
            .from('health_profiles')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (existing) {
            // Update existing
            const { data, error } = await supabase
                .from('health_profiles')
                .update({
                    ...healthData,
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', userId)
                .select()
                .single();
            return { data, error };
        } else {
            // Insert new
            const { data, error } = await supabase
                .from('health_profiles')
                .insert({
                    user_id: userId,
                    ...healthData,
                })
                .select()
                .single();
            return { data, error };
        }
    } catch (e: any) {
        console.error('[SupabaseData] Save health profile exception:', e);
        return { data: null, error: { message: e.message } };
    }
}

/**
 * Get health profile from Supabase
 */
export async function getHealthProfileFromSupabase(
    userId: string
): Promise<{ data: SupabaseHealthProfile | null; error: any }> {
    if (!isSupabaseConfigured) {
        return { data: null, error: { message: 'Supabase not configured' } };
    }

    try {
        const { data, error } = await supabase
            .from('health_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        return { data, error };
    } catch (e: any) {
        console.error('[SupabaseData] Get health profile exception:', e);
        return { data: null, error: { message: e.message } };
    }
}
