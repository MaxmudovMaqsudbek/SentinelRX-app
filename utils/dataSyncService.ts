/**
 * 🔄 DataSyncService - Unified Data Sync Layer
 * 
 * Architecture: Offline-First with Cloud Sync
 * - All writes go to local storage first (instant UI)
 * - If authenticated, also sync to Supabase (cloud persistence)
 * - On login, pull data from cloud and merge with local
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { isSupabaseConfigured } from './supabase';
import {
    // Profile
    getProfileFromSupabase,
    createProfile,
    updateProfile,
    // Health
    getHealthProfileFromSupabase,
    saveHealthProfileToSupabase,
    // Reminders
    getRemindersFromSupabase,
    saveReminderToSupabase,
    updateReminderInSupabase,
    deleteReminderFromSupabase,
    // Family
    getFamilyMembersFromSupabase,
    saveFamilyMemberToSupabase,
    updateFamilyMemberInSupabase,
    deleteFamilyMemberFromSupabase,
    // Scan History
    getScanHistory as getCloudScanHistory,
    addScanToSupabase,
    // Gamification
    getGamification,
    updateGamification as updateCloudGamification,
    // Types
    SupabaseReminder,
    SupabaseFamilyMember,
    SupabaseHealthProfile,
    SupabaseScanHistory,
    SupabaseGamification,
} from './supabaseData';

import {
    Reminder,
    FamilyMember,
    ScanHistoryItem,
    GamificationData,
    UserProfile,
    saveReminder as saveLocalReminder,
    getReminders as getLocalReminders,
    deleteReminder as deleteLocalReminder,
    saveFamilyMember as saveLocalFamilyMember,
    getFamilyMembers as getLocalFamilyMembers,
    addScanToHistory as addLocalScan,
    getScanHistory as getLocalScanHistory,
    getGamificationData as getLocalGamification,
    saveGamificationData as saveLocalGamification,
    getUserProfile as getLocalProfile,
    saveUserProfile as saveLocalProfile,
} from './storage';

// ============================================
// Types
// ============================================

interface SyncResult {
    success: boolean;
    message: string;
    synced?: number;
}

// ============================================
// Core Sync Service
// ============================================

/**
 * 🔄 Sync all user data from Supabase to local storage on login
 * Called when auth state changes to SIGNED_IN
 */
export async function syncOnLogin(userId: string): Promise<SyncResult> {
    if (!isSupabaseConfigured) {
        console.log('[DataSync] Supabase not configured, using local only');
        return { success: true, message: 'Local only mode' };
    }

    console.log('[DataSync] 🔄 Starting sync for user:', userId);
    let synced = 0;

    try {
        // 1. Sync Reminders
        const { data: cloudReminders } = await getRemindersFromSupabase(userId);
        if (cloudReminders && cloudReminders.length > 0) {
            for (const cr of cloudReminders) {
                const localReminder: Reminder = {
                    id: cr.id,
                    medicationId: cr.medication_id,
                    medicationName: cr.medication_name,
                    dosage: cr.dosage || '',
                    time: cr.time,
                    frequency: (cr.frequency as 'daily' | 'weekly' | 'monthly' | 'as_needed') || 'daily',
                    daysOfWeek: cr.days_of_week || undefined,
                    isEnabled: cr.is_enabled,
                    lastTaken: cr.last_taken || undefined,
                    takenDates: cr.taken_dates || [],
                };
                await saveLocalReminder(localReminder);
                synced++;
            }
            console.log('[DataSync] ✅ Synced', cloudReminders.length, 'reminders');
        }

        // 2. Sync Family Members
        const { data: cloudFamily } = await getFamilyMembersFromSupabase(userId);
        if (cloudFamily && cloudFamily.length > 0) {
            for (const cf of cloudFamily) {
                const localMember: FamilyMember = {
                    id: cf.id,
                    name: cf.name,
                    relationship: cf.relationship || '',
                    inviteCode: cf.invite_code || '',
                    isConnected: cf.is_connected,
                    adherencePercentage: cf.adherence_percentage,
                };
                await saveLocalFamilyMember(localMember);
                synced++;
            }
            console.log('[DataSync] ✅ Synced', cloudFamily.length, 'family members');
        }

        // 3. Sync Health Profile to UserProfile
        const { data: cloudHealth } = await getHealthProfileFromSupabase(userId);
        if (cloudHealth) {
            const localProfile = await getLocalProfile();
            const updatedProfile: UserProfile = {
                ...localProfile,
                age: cloudHealth.age || localProfile.age,
                allergies: cloudHealth.allergies || localProfile.allergies,
                chronicConditions: cloudHealth.conditions || localProfile.chronicConditions,
            };
            await saveLocalProfile(updatedProfile);
            synced++;
            console.log('[DataSync] ✅ Synced health profile');
        }

        // 4. Sync Gamification
        const { data: cloudGamification } = await getGamification(userId);
        if (cloudGamification) {
            const localGamification: GamificationData = {
                points: cloudGamification.points,
                level: cloudGamification.level,
                streak: cloudGamification.streak,
                lastActiveDate: new Date().toISOString().split('T')[0],
                achievements: cloudGamification.badges || [],
                scansThisWeek: 0,
                reportsThisMonth: 0,
                totalInteractionsChecked: 0,
                totalReportsSubmitted: 0,
            };
            await saveLocalGamification(localGamification);
            synced++;
            console.log('[DataSync] ✅ Synced gamification');
        }

        console.log('[DataSync] ✅ Sync complete! Synced', synced, 'items');
        return { success: true, message: `Synced ${synced} items from cloud`, synced };
    } catch (error: any) {
        console.error('[DataSync] ❌ Sync error:', error);
        return { success: false, message: error.message || 'Sync failed' };
    }
}

// ============================================
// Reminder Sync Operations
// ============================================

/**
 * Save reminder with cloud sync
 */
export async function saveReminderWithSync(
    reminder: Reminder,
    userId?: string | null
): Promise<void> {
    // 1. Save to local first (instant)
    await saveLocalReminder(reminder);
    console.log('[DataSync] Reminder saved locally:', reminder.medicationName);

    // 2. Sync to cloud if authenticated
    if (userId && isSupabaseConfigured) {
        await saveReminderToSupabase(userId, {
            medication_id: reminder.medicationId,
            medication_name: reminder.medicationName,
            dosage: reminder.dosage,
            time: reminder.time,
            frequency: reminder.frequency,
            days_of_week: reminder.daysOfWeek,
            is_enabled: reminder.isEnabled,
        });
        console.log('[DataSync] Reminder synced to cloud');
    }
}

/**
 * Delete reminder with cloud sync
 */
export async function deleteReminderWithSync(
    reminderId: string,
    userId?: string | null
): Promise<void> {
    // 1. Delete from local first
    await deleteLocalReminder(reminderId);
    console.log('[DataSync] Reminder deleted locally');

    // 2. Delete from cloud if authenticated
    if (userId && isSupabaseConfigured) {
        await deleteReminderFromSupabase(reminderId);
        console.log('[DataSync] Reminder deleted from cloud');
    }
}

// ============================================
// Family Member Sync Operations
// ============================================

/**
 * Save family member with cloud sync
 */
export async function saveFamilyMemberWithSync(
    member: FamilyMember,
    userId?: string | null
): Promise<void> {
    // 1. Save to local first
    await saveLocalFamilyMember(member);
    console.log('[DataSync] Family member saved locally:', member.name);

    // 2. Sync to cloud if authenticated
    if (userId && isSupabaseConfigured) {
        await saveFamilyMemberToSupabase(userId, {
            name: member.name,
            relationship: member.relationship,
            invite_code: member.inviteCode,
        });
        console.log('[DataSync] Family member synced to cloud');
    }
}

// ============================================
// Scan History Sync Operations
// ============================================

/**
 * Add scan to history with cloud sync
 */
export async function addScanWithSync(
    scan: ScanHistoryItem,
    userId?: string | null
): Promise<void> {
    // 1. Save to local first
    await addLocalScan(scan);
    console.log('[DataSync] Scan saved locally:', scan.medicationName);

    // 2. Sync to cloud if authenticated
    if (userId && isSupabaseConfigured) {
        await addScanToSupabase(
            userId,
            scan.medicationName,
            scan.confidence * 100, // Convert to 0-100 score
            0, // interactions found
            scan.imageUri
        );
        console.log('[DataSync] Scan synced to cloud');
    }
}

// ============================================
// Health Profile Sync Operations
// ============================================

/**
 * Save health profile with cloud sync
 */
export async function saveHealthProfileWithSync(
    allergies: string[],
    conditions: string[],
    age?: number,
    userId?: string | null
): Promise<void> {
    // 1. Save to local profile
    const localProfile = await getLocalProfile();
    const updatedProfile: UserProfile = {
        ...localProfile,
        allergies,
        chronicConditions: conditions,
        age: age || localProfile.age,
    };
    await saveLocalProfile(updatedProfile);
    console.log('[DataSync] Health profile saved locally');

    // 2. Sync to cloud if authenticated
    if (userId && isSupabaseConfigured) {
        await saveHealthProfileToSupabase(userId, {
            allergies,
            conditions,
            age,
        });
        console.log('[DataSync] Health profile synced to cloud');
    }
}

// ============================================
// Gamification Sync Operations
// ============================================

/**
 * Add points with cloud sync
 */
export async function addPointsWithSync(
    points: number,
    userId?: string | null
): Promise<GamificationData> {
    // 1. Update local gamification
    const { addPoints } = await import('./storage');
    const updated = await addPoints(points);
    console.log('[DataSync] Points added locally:', points);

    // 2. Sync to cloud if authenticated
    if (userId && isSupabaseConfigured) {
        await updateCloudGamification(userId, {
            points: updated.points,
            level: updated.level,
            streak: updated.streak,
        });
        console.log('[DataSync] Gamification synced to cloud');
    }

    return updated;
}

// ============================================
// Export all functions
// ============================================

export const DataSyncService = {
    syncOnLogin,
    saveReminderWithSync,
    deleteReminderWithSync,
    saveFamilyMemberWithSync,
    addScanWithSync,
    saveHealthProfileWithSync,
    addPointsWithSync,
};

export default DataSyncService;
