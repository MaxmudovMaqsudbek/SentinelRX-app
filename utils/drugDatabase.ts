import verifiedMeds from "../assets/data/medications.json";

export interface DrugInfo {
  id: string;
  name: string;
  genericName: string;
  manufacturer: string;
  dosage: string;
  shape: string;
  color: string;
  imprint?: string;
  description: string;
  warnings: string[];
  sideEffects: string[];
  interactions: string[];
  pregnancyCategory: string;
  category: string;
  price?: number; // Added price for static DB
  currency?: string;
  barcode?: string;
}

export interface DrugPriceData {
  drugId: string;
  genericName: string;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  stdDeviation: number;
  priceHistory: number[];
  currency: string;
}

// ============================================================================
// REAL MEDICINE DATABASE (TASHKENT, UZBEKISTAN - 2024 GOLDEN SET)
// ============================================================================

const HARDCODED_MEDS: DrugInfo[] = [
  {
    id: "uz_med_001",
    name: "Trimol",
    genericName: "Paracetamol + Diclofenac",
    manufacturer: "Meri Farm (India)",
    dosage: "500mg/50mg",
    shape: "Round",
    color: "White",
    imprint: "TRIMOL",
    description: "Combined analgesic and anti-inflammatory drug. Used for headache, toothache, muscle pain.",
    warnings: ["Do not take on empty stomach", "Avoid alcohol"],
    sideEffects: ["Nausea", "Dizziness", "Stomach pain"],
    interactions: ["Warfarin", "Aspirin"],
    pregnancyCategory: "C",
    category: "OTC",
    price: 12000,
    currency: "UZS"
  },
  {
    id: "uz_med_002",
    name: "Kyupene",
    genericName: "Ibuprofen + Paracetamol",
    manufacturer: "Kusum Healthcare",
    dosage: "400mg/325mg",
    shape: "Oval",
    color: "White",
    description: "Effective pain reliever for moderate to severe pain.",
    warnings: ["Consult doctor if pregnant", "Maximum 3 tablets per day"],
    sideEffects: ["Gastric irritation", "Drowsiness"],
    interactions: ["Other NSAIDs"],
    pregnancyCategory: "C",
    category: "OTC",
    price: 18000,
    currency: "UZS"
  },
  {
    id: "uz_med_003",
    name: "Almagel",
    genericName: "Aluminium phosphate + Magnesium",
    manufacturer: "Teva (Bulgaria)",
    dosage: "170ml",
    shape: "Liquid",
    color: "White",
    description: "Antacid suspension for gastritis and heartburn relief.",
    warnings: ["Shake well before use", "Take 30 min before meals"],
    sideEffects: ["Constipation", "Nausea"],
    interactions: ["Tetracyclines", "Iron supplements"],
    pregnancyCategory: "Safe",
    category: "OTC",
    price: 75000,
    currency: "UZS"
  },
  {
    id: "uz_med_004",
    name: "Nimesil",
    genericName: "Nimesulide",
    manufacturer: "Berlin-Chemie (Germany)",
    dosage: "100mg",
    shape: "Granules",
    color: "Pale Yellow",
    description: "Non-steroidal anti-inflammatory drug (NSAID) with analgesic and antipyretic properties.",
    warnings: ["Dissolve in water", "Do not give to children under 12"],
    sideEffects: ["Heartburn", "Nausea"],
    interactions: ["Aspirin", "Methotrexate"],
    pregnancyCategory: "D",
    category: "Prescription",
    price: 4500, // Per sachet
    currency: "UZS"
  },
  {
    id: "uz_med_005",
    name: "Rheosorbilact",
    genericName: "Sorbitol + Electrolytes",
    manufacturer: "Yuria-Pharm (Ukraine)",
    dosage: "200ml",
    shape: "Liquid",
    color: "Clear",
    description: "Plasma substitute solution for detoxification and rehydration.",
    warnings: ["Intravenous use only", "Check for clarity"],
    sideEffects: ["Alkalosis (rare)"],
    interactions: [],
    pregnancyCategory: "B",
    category: "Prescription",
    price: 35000,
    currency: "UZS"
  },
  {
    id: "uz_med_006",
    name: "Tabex",
    genericName: "Cytisine",
    manufacturer: "Sopharma (Bulgaria)",
    dosage: "1.5mg",
    shape: "Round",
    color: "Brown",
    description: "Herbal product for smoking cessation.",
    warnings: ["Follow strict schedule", "Stop smoking while taking"],
    sideEffects: ["Dry mouth", "Insomnia"],
    interactions: ["Anti-tuberculosis drugs"],
    pregnancyCategory: "X",
    category: "OTC",
    price: 400000,
    currency: "UZS"
  },
  {
    id: "uz_med_007",
    name: "Supralgin",
    genericName: "Diclofenac Sodium",
    manufacturer: "GMP (Georgia)",
    dosage: "75mg/3ml",
    shape: "Liquid",
    color: "Clear",
    description: "Potent anti-inflammatory injection for acute pain.",
    warnings: ["Deep intramuscular injection", "Do not mix with other drugs"],
    sideEffects: ["Injection site pain", "Dizziness"],
    interactions: ["Warfarin", "Diuretics"],
    pregnancyCategory: "C",
    category: "Prescription",
    price: 32500,
    currency: "UZS"
  },
  {
    id: "uz_med_008",
    name: "Avamys",
    genericName: "Fluticasone Furoate",
    manufacturer: "GSK (UK)",
    dosage: "27.5mcg",
    shape: "Spray",
    color: "White Container",
    description: "Nasal spray for allergic rhinitis.",
    warnings: ["Shake well", "Use regularly for best results"],
    sideEffects: ["Nosebleed", "Headache"],
    interactions: ["Ritonavir"],
    pregnancyCategory: "C",
    category: "Prescription",
    price: 139000,
    currency: "UZS"
  },
  {
    id: "uz_med_009",
    name: "Nazivin",
    genericName: "Oxymetazoline",
    manufacturer: "Merck (Germany)",
    dosage: "0.05%",
    shape: "Drops",
    color: "Clear",
    description: "Nasal drops for congestion relief.",
    warnings: ["Do not use for more than 5-7 days"],
    sideEffects: ["Dryness", "Sneezing"],
    interactions: ["MAO inhibitors"],
    pregnancyCategory: "C",
    category: "OTC",
    price: 45000,
    currency: "UZS"
  },
  {
    id: "uz_med_010",
    name: "Loroben",
    genericName: "Chlorhexidine + Benzydamine",
    manufacturer: "Drogsan (Turkey)",
    dosage: "200ml",
    shape: "Liquid",
    color: "Green",
    description: "Antiseptic mouthwash/spray for sore throat.",
    warnings: ["Do not swallow", "Avoid eye contact"],
    sideEffects: ["Numbness in mouth"],
    interactions: [],
    pregnancyCategory: "B",
    category: "OTC",
    price: 150000,
    currency: "UZS"
  },
  {
    id: "uz_med_011",
    name: "Tivortin",
    genericName: "Arginine Hydrochloride",
    manufacturer: "Yuria-Pharm",
    dosage: "100ml",
    shape: "Liquid",
    color: "Clear",
    description: "Cardiovascular support and detoxification.",
    warnings: ["Monitor blood pressure"],
    sideEffects: ["Mild nausea"],
    interactions: [],
    pregnancyCategory: "B",
    category: "Prescription",
    price: 45000,
    currency: "UZS"
  },
  // ============================================================================
  // DEMO MEDICATIONS (User-Specified for Barcode/Pill Recognition)
  // ============================================================================
  {
    id: "uz_demo_azithromycin",
    name: "Azithromycin",
    genericName: "Azithromycin (Macrolide Antibiotic)",
    manufacturer: "Various (Antibiotic)",
    dosage: "500mg",
    shape: "Oval",
    color: "Blue/White",
    imprint: "AZ500",
    description: "Macrolide antibiotic that inhibits bacterial protein synthesis. Used for respiratory tract infections, skin infections, ear infections, and sexually transmitted infections. Known for excellent tissue penetration and once-daily dosing.",
    warnings: [
      "Complete the full prescribed course even if symptoms improve",
      "Do not take with antacids containing aluminum or magnesium",
      "May cause QT prolongation - use caution with heart conditions",
      "Not effective against viral infections (cold/flu)",
      "Prescription only medication"
    ],
    sideEffects: [
      "Nausea and vomiting",
      "Diarrhea (may be severe)",
      "Stomach pain",
      "Headache",
      "Dizziness",
      "Liver problems (rare)"
    ],
    interactions: [
      "Warfarin (increased bleeding risk)",
      "Digoxin (increased serum levels)",
      "Antacids (reduced effectiveness)",
      "Colchicine (increased toxicity)",
      "Nelfinavir (increased azithromycin levels)",
      "Amiodarone (QT prolongation risk)"
    ],
    pregnancyCategory: "B",
    category: "Prescription",
    price: 45000,
    currency: "UZS"
  },
  {
    id: "uz_demo_groprinosin",
    name: "Groprinosin Forte",
    genericName: "Inosine Pranobex (Immunostimulant)",
    manufacturer: "Gedeon Richter (Hungary)",
    dosage: "1000mg",
    shape: "Oblong",
    color: "White",
    imprint: "GROPRINOSIN",
    description: "Antiviral and immunostimulant medication. Treats cold sores caused by herpes simplex virus and supports immune function in recurrent upper respiratory infections. Works by inhibiting viral replication and stimulating T-lymphocyte activity.",
    warnings: [
      "Do not use during acute gout attack",
      "Not for children under 1 year of age",
      "Monitor uric acid levels during long-term use",
      "May form kidney stones with prolonged use (3+ months)",
      "Requires prior herpes diagnosis before use"
    ],
    sideEffects: [
      "Increased uric acid in blood/urine (very common)",
      "Nausea and vomiting",
      "Abdominal pain",
      "Skin itching or rash",
      "Headache and dizziness",
      "Joint pain (arthralgia)",
      "Fatigue or malaise"
    ],
    interactions: [
      "Allopurinol (gout medications)",
      "Diuretics (increased uric acid)",
      "Immunosuppressants",
      "Azidothymidine (AZT for HIV)"
    ],
    pregnancyCategory: "C",
    category: "OTC",
    price: 85000,
    currency: "UZS"
  }
];

export const COMPREHENSIVE_DRUG_DATABASE: DrugInfo[] = [
  ...HARDCODED_MEDS,
  ...(verifiedMeds as any[]).map(m => ({
    sideEffects: [],
    warnings: [],
    interactions: [],
    imprint: "",
    shape: "Unknown",
    color: "Unknown",
    ...m
  }) as DrugInfo)
];

// Alias for compatibility
export const SAMPLE_DRUGS = COMPREHENSIVE_DRUG_DATABASE;

// Automatically generated price database from the Golden Set
export const DRUG_PRICE_DATABASE: DrugPriceData[] = COMPREHENSIVE_DRUG_DATABASE.map(drug => ({
  drugId: drug.id,
  genericName: drug.name, // Use brand name for easy lookup in this context
  averagePrice: drug.price || 0,
  minPrice: (drug.price || 0) * 0.9,
  maxPrice: (drug.price || 0) * 1.2,
  stdDeviation: (drug.price || 0) * 0.1,
  priceHistory: [
    (drug.price || 0) * 0.95,
    (drug.price || 0) * 0.98,
    (drug.price || 0),
    (drug.price || 0) * 1.05,
    (drug.price || 0)
  ],
  currency: "UZS"
}));

// ============================================================================
// HELPERS FOR AI SERVICES (Compatibility Layer)
// ============================================================================

export interface DrugInteraction {
  drug: string;
  severity: "High" | "Moderate" | "Low";
  description: string;
}

import INTERACTIONS_DB from "../assets/data/interactions.json";

export const EXTENDED_INTERACTIONS: Record<string, DrugInteraction[]> = INTERACTIONS_DB as unknown as Record<string, DrugInteraction[]>;

export function checkInteractions(drugName: string, currentMeds: string[]): DrugInteraction[] {
  try {
    const interactions: DrugInteraction[] = [];
    if (!drugName || !currentMeds || !Array.isArray(currentMeds)) return [];

    // Helper for case-insensitive lookup
    const findInteractions = (name: string): DrugInteraction[] => {
      if (!name) return [];
      const nameLower = name.toLowerCase();
      const genericKey = name.split(' ')[0].toLowerCase();

      // precise match or generic match
      const key = Object.keys(EXTENDED_INTERACTIONS).find(k =>
        k.toLowerCase() === nameLower || k.toLowerCase() === genericKey
      );
      return key ? EXTENDED_INTERACTIONS[key] : [];
    };

    // 1. Check direct matches from the database (Forward Check)
    const knownBadInteractions = findInteractions(drugName);

    knownBadInteractions.forEach(known => {
      // Check if the interacting drug (e.g. "Warfarin") is in the user's current meds list
      if (!known || !known.drug) return;

      const match = currentMeds.find(med =>
        med && typeof med === 'string' &&
        (med.toLowerCase().includes(known.drug.toLowerCase()) ||
          known.drug.toLowerCase().includes(med.toLowerCase()))
      );

      if (match) {
        interactions.push(known);
      }
    });

    // 2. Reverse check: Check if current meds have rules against THIS new drug
    currentMeds.forEach(med => {
      if (!med || typeof med !== 'string') return;

      const medRisks = findInteractions(med);

      medRisks.forEach(risk => {
        if (!risk || !risk.drug) return;
        // Case insensitive comparison
        const dNameLower = drugName.toLowerCase();
        const riskDrugLower = risk.drug.toLowerCase();

        if (dNameLower.includes(riskDrugLower) || riskDrugLower.includes(dNameLower)) {
          // Avoid duplicates
          if (!interactions.some(i => i.drug === med)) {
            interactions.push({
              drug: med, // The interaction is WITH the current med
              severity: risk.severity,
              description: risk.description
            });
          }
        }
      });
    });

    return interactions;
  } catch (e) {
    console.error("Critical Error in Interaction Check:", e);
    return []; // Return empty array on crash to keep app alive
  }
}



export function getDrugPriceByGeneric(genericName: string): DrugPriceData | null {
  return DRUG_PRICE_DATABASE.find(d =>
    d.genericName.toLowerCase().includes(genericName.toLowerCase()) ||
    genericName.toLowerCase().includes(d.genericName.toLowerCase())
  ) || null;
}

// ============================================================================
// RESTORED HELPERS (Fixed Missing Exports)
// ============================================================================

export function getDrugById(id: string): DrugInfo | undefined {
  return COMPREHENSIVE_DRUG_DATABASE.find(d => d.id === id);
}

export function checkSafetyForProfile(drug: DrugInfo, profile: any): string[] {
  const alerts: string[] = [];
  if (!drug || !profile) return alerts;

  // 1. Pregnancy Check
  if (profile.isPregnant && (drug.pregnancyCategory === 'D' || drug.pregnancyCategory === 'X')) {
    alerts.push(`Pregnancy Risk: Category ${drug.pregnancyCategory} is unsafe.`);
  }

  // 2. Age Check
  if (profile.age && profile.age > 60 && drug.warnings.some(w => w.toLowerCase().includes('elderly'))) {
    alerts.push("Age Risk: Use with caution for seniors.");
  }

  // 3. Allergy Check (Mock: If allergy matches drug name or generic)
  if (profile.allergies && Array.isArray(profile.allergies)) {
    profile.allergies.forEach((allergy: string) => {
      if (drug.name.toLowerCase().includes(allergy.toLowerCase()) ||
        drug.genericName.toLowerCase().includes(allergy.toLowerCase())) {
        alerts.push(`ALLERGY WARNING: Contains ${allergy}`);
      }
    });
  }

  return alerts;
}
