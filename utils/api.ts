/**
 * Centralized API Client for Sentinel-RX Backend
 * Configure API_BASE_URL with your backend endpoint
 */

// TODO: Replace with your production API URL
const API_BASE_URL = "https://your-api-server.com/api/v1";

// ==============================================================================
// 1. CORE TYPES & HELPERS
// ==============================================================================

export interface ApiResponse<T> {
    data: T | null;
    error: string | null;
}

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
    authToken = token;
};

/**
 * Generic fetch wrapper with error handling, timeout, and auth injection.
 */
async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout for heavier AI tasks

    try {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(options.headers as Record<string, string>),
        };

        if (authToken) {
            headers["Authorization"] = `Bearer ${authToken}`;
        }

        const config: RequestInit = {
            ...options,
            signal: controller.signal,
            headers,
        };

        // Handle FormData (remove Content-Type to let browser set boundary)
        if (options.body instanceof FormData) {
            delete headers["Content-Type"];
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        clearTimeout(timeout);

        if (!response.ok) {
            const errorBody = await response.text();
            try {
                // Try to parse JSON error details
                const jsonError = JSON.parse(errorBody);
                const serverMsg = jsonError.detail || jsonError.message;
                const msg = typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg);
                console.warn(`API Fail ${response.status}: ${msg}`);
                return { data: null, error: msg || `Error ${response.status}` };
            } catch {
                console.error(`API Error ${response.status}: ${errorBody}`);
                return { data: null, error: `API Error: ${response.status}` };
            }
        }

        // Handle empty responses (e.g. 204 No Content)
        if (response.status === 204) {
            return { data: {} as T, error: null };
        }

        const data = await response.json();
        return { data, error: null };
    } catch (error: any) {
        clearTimeout(timeout);
        if (error.name === "AbortError") {
            return { data: null, error: "Request timed out" };
        }
        console.error("API Fetch error:", error);
        return { data: null, error: error.message || "Network error" };
    }
}

// ==============================================================================
// 2. AUTHENTICATION
// ==============================================================================

export interface AuthResponse {
    access_token: string;
    token_type: string;
    user: UserProfileResponse;
}

export interface UserProfileResponse {
    id: string;
    email: string;
    full_name: string;
    language: string;
    is_active: boolean;
    is_verified: boolean;
    avatar_url?: string;
}

export const authApi = {
    login: async (email: string, password: string) => {
        // OAuth2 standard uses form-urlencoded
        const params = new URLSearchParams();
        params.append("username", email);
        params.append("password", password);

        return apiFetch<AuthResponse>("/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString(),
        });
    },

    register: async (data: { email: string; password: string; full_name: string; language?: string; phone?: string }) => {
        return apiFetch<UserProfileResponse>("/auth/register", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    logout: async () => {
        return apiFetch<void>("/auth/logout", { method: "POST" });
    },
};

// ==============================================================================
// 3. MEDICATIONS
// ==============================================================================

export interface Medication {
    id: string;
    name: string;
    description: string | null;
    dosage_form: string | null;
    strength: string | null;
    manufacturer: string | null;
    image_url: string | null;
    is_prescription_required: boolean;
}

export const medicationsApi = {
    search: async (query: string) => {
        const params = new URLSearchParams({ q: query });
        return apiFetch<Medication[]>(`/medications/search?${params}`);
    },

    getDetails: async (id: string) => {
        return apiFetch<Medication>(`/medications/${id}`);
    },

    getMyList: async () => {
        return apiFetch<Medication[]>(`/medications/my/list`);
    },

    addToMyList: async (medicationId: string, dailyDosage: string = "1 pill") => {
        return apiFetch<any>(`/medications/my/list`, {
            method: "POST",
            body: JSON.stringify({ medication_id: medicationId, daily_dosage: dailyDosage }),
        });
    },

    removeFromMyList: async (userMedicationId: string) => {
        return apiFetch<void>(`/medications/my/list/${userMedicationId}`, {
            method: "DELETE",
        });
    },
};

// ==============================================================================
// 4. SCANS & RECOGNITION (CORE AI)
// ==============================================================================

export interface ScanResult {
    id: string;
    medication_id: string | null;
    medication_name: string | null;
    confidence: number;
    image_url: string;
    scanned_at: string;
    detected_text?: string;
    details?: any;
}

export const scansApi = {
    uploadImage: async (imageUri: string) => {
        const formData = new FormData();
        // React Native specific FormData handling
        const filename = imageUri.split('/').pop() || "scan.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append("image", { uri: imageUri, name: filename, type } as any);

        return apiFetch<any>("/scans/image", {
            method: "POST",
            body: formData,
        });
    },

    history: async () => {
        return apiFetch<ScanResult[]>("/scans/history");
    },
};

// ==============================================================================
// 5. DRUG INTERACTIONS
// ==============================================================================

export interface InteractionResult {
    severity: "high" | "moderate" | "low" | "none";
    description: string;
    mechanism: string | null;
    management: string | null;
    drug1_id: string;
    drug2_id: string;
    drug1_name: string;
    drug2_name: string;
}

export const interactionsApi = {
    check: async (medicationIds: string[]) => {
        return apiFetch<InteractionResult[]>("/interactions/check", {
            method: "POST",
            body: JSON.stringify({ medication_ids: medicationIds }),
        });
    },

    checkWithMyMeds: async (medicationId: string) => {
        const params = new URLSearchParams({ medication_id: medicationId });
        return apiFetch<InteractionResult[]>(`/interactions/check/with-my-medications?${params}`, {
            method: "POST",
        });
    },
};

// ==============================================================================
// 6. PHARMACIES (EXISTING + NEW)
// ==============================================================================

export interface PharmacyApiResponse {
    id: string;
    name: string;
    chain: string | null;
    address: string;
    city: string | null;
    latitude: number;
    longitude: number;
    distance_km: number | null;
    phone: string | null;
    is_verified: boolean;
    is_24_hours: boolean;
    is_open: boolean | null;
    rating: number | null;
    has_delivery: boolean;
    image_url: string | null;
}

export const pharmaciesApi = {
    getNearby: async (lat: number, lon: number, radiusKm: number = 5, limit: number = 20) => {
        const params = new URLSearchParams({
            latitude: lat.toString(),
            longitude: lon.toString(),
            radius_km: radiusKm.toString(),
            limit: limit.toString(),
        });
        return apiFetch<PharmacyApiResponse[]>(`/pharmacies/nearby?${params}`);
    },

    getDetails: async (id: string) => {
        return apiFetch<any>(`/pharmacies/${id}`); // TBD: Use full type if needed
    },
};

// Backwards compatibility for the existing PharmacyScreen
export const getNearbyPharmacies = pharmaciesApi.getNearby;
export const getPharmacyDetails = pharmaciesApi.getDetails;

// ==============================================================================
// 7. GAMIFICATION & FAMILY
// ==============================================================================

export const gamificationApi = {
    getPoints: async () => apiFetch<any>("/gamification/points"),
    getHistory: async () => apiFetch<any[]>("/gamification/points/history"),
    getLeaderboard: async () => apiFetch<any[]>("/gamification/leaderboard"),
    getBadges: async () => apiFetch<any[]>("/gamification/badges"),
};

export const familyApi = {
    getDashboard: async () => apiFetch<any>("/dashboard/summary"),
    getMember: async (id: string) => apiFetch<any>(`/dashboard/family/${id}`),
};

// ==============================================================================
// 8. HEALTH CHECK
// ==============================================================================

export async function checkApiHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL.replace("/v1", "")}/health`, {
            method: "GET",
        });
        return response.ok;
    } catch {
        return false;
    }
}
