/**
 * 🚀 SyncEngine - Automatic Cloud Sync for All User Data
 * 
 * This engine provides wrapper functions that:
 * 1. Save to local storage first (fast, instant)
 * 2. Automatically sync to Supabase if user is authenticated
 * 
 * Usage: Import these instead of the raw storage functions
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from './supabase';
import {
    addScanToSupabase,
    saveReminderToSupabase,
    updateReminderInSupabase,
    deleteReminderFromSupabase,
    saveFamilyMemberToSupabase,
    deleteFamilyMemberFromSupabase,
    saveHealthProfileToSupabase,
    updateGamification as updateCloudGamification,
    saveMedicationToSupabase,
} from './supabaseData';

// ============================================
// Get Current User ID (cached for performance)
// ============================================

let cachedUserId: string | null = null;

async function getCurrentUserId(): Promise<string | null> {
    if (cachedUserId) return cachedUserId;

    try {
        const { data: { session } } = await supabase.auth.getSession();
        cachedUserId = session?.user?.id || null;
        return cachedUserId;
    } catch {
        return null;
    }
}

// Clear cache on auth change
supabase.auth.onAuthStateChange((event, session) => {
    cachedUserId = session?.user?.id || null;
    console.log('[SyncEngine] User ID updated:', cachedUserId ? 'authenticated' : 'logged out');
});

// ============================================
// Scan History Auto-Sync
// ============================================

/**
 * Add scan to history with automatic cloud sync
 * Call this instead of addScanToHistory from storage.ts
 */
export async function syncScanToCloud(
    medicationName: string,
    confidence: number,
    imageUri?: string
): Promise<void> {
    const userId = await getCurrentUserId();

    if (!userId || !isSupabaseConfigured) {
        console.log('[SyncEngine] Not authenticated, scan saved locally only');
        return;
    }

    try {
        await addScanToSupabase(
            userId,
            medicationName,
            Math.round(confidence * 100), // Convert to 0-100
            0, // interactions found
            imageUri
        );
        console.log('[SyncEngine] ✅ Scan synced to cloud:', medicationName);
    } catch (e) {
        console.error('[SyncEngine] Scan sync failed:', e);
    }
}

// ============================================
// Reminder Auto-Sync
// ============================================

/**
 * Sync reminder to cloud after local save
 */
export async function syncReminderToCloud(reminder: {
    id: string;
    medicationId: string;
    medicationName: string;
    dosage: string;
    time: string;
    frequency: string;
    daysOfWeek?: number[];
    isEnabled: boolean;
}): Promise<void> {
    const userId = await getCurrentUserId();

    if (!userId || !isSupabaseConfigured) {
        console.log('[SyncEngine] Not authenticated, reminder saved locally only');
        return;
    }

    try {
        await saveReminderToSupabase(userId, {
            medication_id: reminder.medicationId,
            medication_name: reminder.medicationName,
            dosage: reminder.dosage,
            time: reminder.time,
            frequency: reminder.frequency,
            days_of_week: reminder.daysOfWeek,
            is_enabled: reminder.isEnabled,
        });
        console.log('[SyncEngine] ✅ Reminder synced to cloud:', reminder.medicationName);
    } catch (e) {
        console.error('[SyncEngine] Reminder sync failed:', e);
    }
}

/**
 * Sync reminder deletion to cloud
 */
export async function syncReminderDeleteToCloud(reminderId: string): Promise<void> {
    const userId = await getCurrentUserId();

    if (!userId || !isSupabaseConfigured) return;

    try {
        await deleteReminderFromSupabase(reminderId);
        console.log('[SyncEngine] ✅ Reminder deleted from cloud');
    } catch (e) {
        console.error('[SyncEngine] Reminder delete sync failed:', e);
    }
}

// ============================================
// Family Member Auto-Sync
// ============================================

/**
 * Sync family member to cloud after local save
 */
export async function syncFamilyMemberToCloud(member: {
    name: string;
    relationship: string;
    inviteCode: string;
}): Promise<void> {
    const userId = await getCurrentUserId();

    if (!userId || !isSupabaseConfigured) {
        console.log('[SyncEngine] Not authenticated, family member saved locally only');
        return;
    }

    try {
        await saveFamilyMemberToSupabase(userId, {
            name: member.name,
            relationship: member.relationship,
            invite_code: member.inviteCode,
        });
        console.log('[SyncEngine] ✅ Family member synced to cloud:', member.name);
    } catch (e) {
        console.error('[SyncEngine] Family member sync failed:', e);
    }
}

// ============================================
// Medication Auto-Sync
// ============================================

/**
 * Sync medication to cloud after local save
 */
export async function syncMedicationToCloud(medication: {
    name: string;
    dosage?: string;
    frequency?: string;
    notes?: string;
}): Promise<void> {
    const userId = await getCurrentUserId();

    if (!userId || !isSupabaseConfigured) {
        console.log('[SyncEngine] Not authenticated, medication saved locally only');
        return;
    }

    try {
        await saveMedicationToSupabase(
            userId,
            medication.name,
            medication.dosage,
            medication.frequency,
            undefined, // time_of_day
            medication.notes
        );
        console.log('[SyncEngine] ✅ Medication synced to cloud:', medication.name);
    } catch (e) {
        console.error('[SyncEngine] Medication sync failed:', e);
    }
}

// ============================================
// Health Profile Auto-Sync
// ============================================

/**
 * Sync health profile to cloud
 */
export async function syncHealthProfileToCloud(data: {
    age?: number;
    allergies?: string[];
    conditions?: string[];
}): Promise<void> {
    const userId = await getCurrentUserId();

    if (!userId || !isSupabaseConfigured) {
        console.log('[SyncEngine] Not authenticated, health profile saved locally only');
        return;
    }

    try {
        await saveHealthProfileToSupabase(userId, {
            age: data.age,
            allergies: data.allergies,
            conditions: data.conditions,
        });
        console.log('[SyncEngine] ✅ Health profile synced to cloud');
    } catch (e) {
        console.error('[SyncEngine] Health profile sync failed:', e);
    }
}

// ============================================
// Gamification Auto-Sync
// ============================================

/**
 * Sync gamification points to cloud
 */
export async function syncGamificationToCloud(data: {
    points: number;
    level: number;
    streak: number;
    badges?: string[];
}): Promise<void> {
    const userId = await getCurrentUserId();

    if (!userId || !isSupabaseConfigured) return;

    try {
        await updateCloudGamification(userId, {
            points: data.points,
            level: data.level,
            streak: data.streak,
            badges: data.badges,
        });
        console.log('[SyncEngine] ✅ Gamification synced to cloud');
    } catch (e) {
        console.error('[SyncEngine] Gamification sync failed:', e);
    }
}

// ============================================
// Export SyncEngine
// ============================================

export const SyncEngine = {
    getCurrentUserId,
    syncScanToCloud,
    syncReminderToCloud,
    syncReminderDeleteToCloud,
    syncFamilyMemberToCloud,
    syncMedicationToCloud,
    syncHealthProfileToCloud,
    syncGamificationToCloud,
};

export default SyncEngine;
