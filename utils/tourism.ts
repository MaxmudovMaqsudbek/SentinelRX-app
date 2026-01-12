import * as Location from "expo-location";
import { Platform } from "react-native";

export interface CountryInfo {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  language: string;
  languageCode: string;
  emergencyNumber: string;
  pharmacyTip: string;
}

export const COUNTRIES: Record<string, CountryInfo> = {
  US: {
    code: "US",
    name: "United States",
    currency: "USD",
    currencySymbol: "$",
    language: "English",
    languageCode: "en",
    emergencyNumber: "911",
    pharmacyTip: "CVS and Walgreens are major pharmacy chains",
  },
  UZ: {
    code: "UZ",
    name: "Uzbekistan",
    currency: "UZS",
    currencySymbol: "so'm",
    language: "O'zbek",
    languageCode: "uz",
    emergencyNumber: "103",
    pharmacyTip: "Look for 'Dorixona' signs for pharmacies",
  },
  RU: {
    code: "RU",
    name: "Russia",
    currency: "RUB",
    currencySymbol: "₽",
    language: "Русский",
    languageCode: "ru",
    emergencyNumber: "112",
    pharmacyTip: "Look for 'Аптека' signs for pharmacies",
  },
  DE: {
    code: "DE",
    name: "Germany",
    currency: "EUR",
    currencySymbol: "€",
    language: "Deutsch",
    languageCode: "de",
    emergencyNumber: "112",
    pharmacyTip: "Look for green cross signs, 'Apotheke'",
  },
  FR: {
    code: "FR",
    name: "France",
    currency: "EUR",
    currencySymbol: "€",
    language: "Français",
    languageCode: "fr",
    emergencyNumber: "15",
    pharmacyTip: "Look for green cross signs, 'Pharmacie'",
  },
  TR: {
    code: "TR",
    name: "Turkey",
    currency: "TRY",
    currencySymbol: "₺",
    language: "Türkçe",
    languageCode: "tr",
    emergencyNumber: "112",
    pharmacyTip: "Look for 'Eczane' signs with red crescent",
  },
  TH: {
    code: "TH",
    name: "Thailand",
    currency: "THB",
    currencySymbol: "฿",
    language: "ไทย",
    languageCode: "th",
    emergencyNumber: "1669",
    pharmacyTip: "Boots and Watson's are common pharmacy chains",
  },
  IN: {
    code: "IN",
    name: "India",
    currency: "INR",
    currencySymbol: "₹",
    language: "हिन्दी",
    languageCode: "hi",
    emergencyNumber: "108",
    pharmacyTip: "Apollo Pharmacy and MedPlus are major chains",
  },
  MX: {
    code: "MX",
    name: "Mexico",
    currency: "MXN",
    currencySymbol: "$",
    language: "Español",
    languageCode: "es",
    emergencyNumber: "065",
    pharmacyTip: "Farmacias Similares offers affordable generics",
  },
  JP: {
    code: "JP",
    name: "Japan",
    currency: "JPY",
    currencySymbol: "¥",
    language: "日本語",
    languageCode: "ja",
    emergencyNumber: "119",
    pharmacyTip: "Look for ドラッグストア (drug stores) or 薬局",
  },
  KR: {
    code: "KR",
    name: "South Korea",
    currency: "KRW",
    currencySymbol: "₩",
    language: "한국어",
    languageCode: "ko",
    emergencyNumber: "119",
    pharmacyTip: "Look for 약국 (yakguk) signs",
  },
  AE: {
    code: "AE",
    name: "UAE",
    currency: "AED",
    currencySymbol: "د.إ",
    language: "العربية",
    languageCode: "ar",
    emergencyNumber: "998",
    pharmacyTip: "Aster and Life Pharmacy are major chains",
  },
};

export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  UZS: 12500,
  RUB: 92.5,
  EUR: 0.92,
  TRY: 32.5,
  THB: 35.8,
  INR: 83.2,
  MXN: 17.2,
  JPY: 149.5,
  KRW: 1340,
  AED: 3.67,
  GBP: 0.79,
};

export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
): number {
  const fromRate = EXCHANGE_RATES[fromCurrency] || 1;
  const toRate = EXCHANGE_RATES[toCurrency] || 1;
  const usdAmount = amount / fromRate;
  return usdAmount * toRate;
}

export function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    USD: "$",
    UZS: "so'm",
    RUB: "₽",
    EUR: "€",
    TRY: "₺",
    THB: "฿",
    INR: "₹",
    MXN: "$",
    JPY: "¥",
    KRW: "₩",
    AED: "د.إ",
    GBP: "£",
  };

  const symbol = symbols[currency] || currency;
  const formatted = amount.toLocaleString(undefined, {
    minimumFractionDigits: currency === "JPY" || currency === "KRW" ? 0 : 2,
    maximumFractionDigits: currency === "JPY" || currency === "KRW" ? 0 : 2,
  });

  return `${symbol}${formatted}`;
}

export const MEDICATION_TRANSLATIONS: Record<
  string,
  Record<string, { name: string; pronunciation?: string }>
> = {
  Aspirin: {
    en: { name: "Aspirin" },
    ru: { name: "Аспирин", pronunciation: "Aspirin" },
    uz: { name: "Aspirin" },
    de: { name: "Aspirin" },
    fr: { name: "Aspirine" },
    es: { name: "Aspirina" },
    tr: { name: "Aspirin" },
    ja: { name: "アスピリン", pronunciation: "Asupirin" },
    ko: { name: "아스피린", pronunciation: "Aseupirin" },
    ar: { name: "أسبرين", pronunciation: "Aspirin" },
  },
  Ibuprofen: {
    en: { name: "Ibuprofen" },
    ru: { name: "Ибупрофен", pronunciation: "Ibuprofen" },
    uz: { name: "Ibuprofen" },
    de: { name: "Ibuprofen" },
    fr: { name: "Ibuprofène" },
    es: { name: "Ibuprofeno" },
    tr: { name: "İbuprofen" },
    ja: { name: "イブプロフェン", pronunciation: "Ibupurofen" },
    ko: { name: "이부프로펜", pronunciation: "Ibupeuropen" },
    ar: { name: "إيبوبروفين", pronunciation: "Ibuprofen" },
  },
  Acetaminophen: {
    en: { name: "Acetaminophen / Tylenol" },
    ru: { name: "Парацетамол", pronunciation: "Paracetamol" },
    uz: { name: "Paracetamol" },
    de: { name: "Paracetamol" },
    fr: { name: "Paracétamol" },
    es: { name: "Paracetamol" },
    tr: { name: "Parasetamol" },
    ja: { name: "アセトアミノフェン", pronunciation: "Asetaminofen" },
    ko: { name: "아세트아미노펜", pronunciation: "Aseteuaminopen" },
    ar: { name: "باراسيتامول", pronunciation: "Paracetamol" },
  },
  Amoxicillin: {
    en: { name: "Amoxicillin" },
    ru: { name: "Амоксициллин", pronunciation: "Amoksitsillin" },
    uz: { name: "Amoksitsillin" },
    de: { name: "Amoxicillin" },
    fr: { name: "Amoxicilline" },
    es: { name: "Amoxicilina" },
    tr: { name: "Amoksisilin" },
    ja: { name: "アモキシシリン", pronunciation: "Amokishishirin" },
    ko: { name: "아목시실린", pronunciation: "Amoksisilin" },
    ar: { name: "أموكسيسيلين", pronunciation: "Amoxicillin" },
  },
  Metformin: {
    en: { name: "Metformin" },
    ru: { name: "Метформин", pronunciation: "Metformin" },
    uz: { name: "Metformin" },
    de: { name: "Metformin" },
    fr: { name: "Metformine" },
    es: { name: "Metformina" },
    tr: { name: "Metformin" },
    ja: { name: "メトホルミン", pronunciation: "Metohorumin" },
    ko: { name: "메트포르민", pronunciation: "Meteuporeumin" },
    ar: { name: "ميتفورمين", pronunciation: "Metformin" },
  },
  Omeprazole: {
    en: { name: "Omeprazole" },
    ru: { name: "Омепразол", pronunciation: "Omeprazol" },
    uz: { name: "Omeprazol" },
    de: { name: "Omeprazol" },
    fr: { name: "Oméprazole" },
    es: { name: "Omeprazol" },
    tr: { name: "Omeprazol" },
    ja: { name: "オメプラゾール", pronunciation: "Omepurazoru" },
    ko: { name: "오메프라졸", pronunciation: "Omepeurajol" },
    ar: { name: "أوميبرازول", pronunciation: "Omeprazole" },
  },
  Lisinopril: {
    en: { name: "Lisinopril" },
    ru: { name: "Лизиноприл", pronunciation: "Lizinopril" },
    uz: { name: "Lizinopril" },
    de: { name: "Lisinopril" },
    fr: { name: "Lisinopril" },
    es: { name: "Lisinopril" },
    tr: { name: "Lizinopril" },
    ja: { name: "リシノプリル", pronunciation: "Rishinopuriru" },
    ko: { name: "리시노프릴", pronunciation: "Risinopeuril" },
    ar: { name: "ليسينوبريل", pronunciation: "Lisinopril" },
  },
  Atorvastatin: {
    en: { name: "Atorvastatin / Lipitor" },
    ru: { name: "Аторвастатин", pronunciation: "Atorvastatin" },
    uz: { name: "Atorvastatin" },
    de: { name: "Atorvastatin" },
    fr: { name: "Atorvastatine" },
    es: { name: "Atorvastatina" },
    tr: { name: "Atorvastatin" },
    ja: { name: "アトルバスタチン", pronunciation: "Atorubasutachin" },
    ko: { name: "아토르바스타틴", pronunciation: "Atoreubaseututin" },
    ar: { name: "أتورفاستاتين", pronunciation: "Atorvastatin" },
  },
};

export function translateMedication(
  medicationName: string,
  targetLanguage: string,
): { name: string; pronunciation?: string } {
  const baseWords = medicationName.split(/[\s\/]+/);
  for (const word of baseWords) {
    const normalizedWord =
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    if (
      MEDICATION_TRANSLATIONS[normalizedWord] &&
      MEDICATION_TRANSLATIONS[normalizedWord][targetLanguage]
    ) {
      return MEDICATION_TRANSLATIONS[normalizedWord][targetLanguage];
    }
  }
  return { name: medicationName };
}

export const PHARMACY_PHRASES: Record<
  string,
  { phrase: string; pronunciation: string }[]
> = {
  en: [
    { phrase: "Where is the nearest pharmacy?", pronunciation: "" },
    { phrase: "I need this medication", pronunciation: "" },
    { phrase: "Do you have a generic version?", pronunciation: "" },
    { phrase: "How much does this cost?", pronunciation: "" },
  ],
  ru: [
    {
      phrase: "Где ближайшая аптека?",
      pronunciation: "Gde blizhayshaya apteka?",
    },
    {
      phrase: "Мне нужно это лекарство",
      pronunciation: "Mne nuzhno eto lekarstvo",
    },
    {
      phrase: "Есть ли дженерик?",
      pronunciation: "Yest' li dzhenerik?",
    },
    { phrase: "Сколько это стоит?", pronunciation: "Skol'ko eto stoit?" },
  ],
  uz: [
    { phrase: "Eng yaqin dorixona qayerda?", pronunciation: "" },
    { phrase: "Menga bu dori kerak", pronunciation: "" },
    { phrase: "Generik versiyasi bormi?", pronunciation: "" },
    { phrase: "Bu qancha turadi?", pronunciation: "" },
  ],
  de: [
    {
      phrase: "Wo ist die nächste Apotheke?",
      pronunciation: "Vo ist dee nekhste Apoteke?",
    },
    {
      phrase: "Ich brauche dieses Medikament",
      pronunciation: "Ikh browkhe deeses Medikament",
    },
    {
      phrase: "Haben Sie ein Generikum?",
      pronunciation: "Haben zee ein Generikum?",
    },
    { phrase: "Wie viel kostet das?", pronunciation: "Vee feel kostet das?" },
  ],
  fr: [
    {
      phrase: "Où est la pharmacie la plus proche?",
      pronunciation: "Oo eh la farmasi la plu prosh?",
    },
    {
      phrase: "J'ai besoin de ce médicament",
      pronunciation: "Zhay bezwan de se medikamohn",
    },
    {
      phrase: "Avez-vous un générique?",
      pronunciation: "Avay voo un zhenereek?",
    },
    { phrase: "Combien ça coûte?", pronunciation: "Kombyen sa koot?" },
  ],
  es: [
    {
      phrase: "¿Dónde está la farmacia más cercana?",
      pronunciation: "Donde esta la farmasia mas serkana?",
    },
    {
      phrase: "Necesito este medicamento",
      pronunciation: "Nesesito este medikamento",
    },
    {
      phrase: "¿Tiene versión genérica?",
      pronunciation: "Tyene version henerika?",
    },
    { phrase: "¿Cuánto cuesta?", pronunciation: "Kwanto kwesta?" },
  ],
  tr: [
    {
      phrase: "En yakın eczane nerede?",
      pronunciation: "En yakun ejane nerede?",
    },
    {
      phrase: "Bu ilaca ihtiyacım var",
      pronunciation: "Bu ilaja ihtiyajum var",
    },
    {
      phrase: "Jenerik versiyonu var mı?",
      pronunciation: "Zhenerik versiyonu var mu?",
    },
    { phrase: "Bu ne kadar?", pronunciation: "Bu ne kadar?" },
  ],
  ja: [
    {
      phrase: "一番近い薬局はどこですか？",
      pronunciation: "Ichiban chikai yakkyoku wa doko desu ka?",
    },
    {
      phrase: "この薬が必要です",
      pronunciation: "Kono kusuri ga hitsuyou desu",
    },
    {
      phrase: "ジェネリックはありますか？",
      pronunciation: "Jenerikku wa arimasu ka?",
    },
    { phrase: "いくらですか？", pronunciation: "Ikura desu ka?" },
  ],
  ko: [
    {
      phrase: "가장 가까운 약국이 어디에요?",
      pronunciation: "Gajang gakkaun yakgugi eodieyo?",
    },
    { phrase: "이 약이 필요해요", pronunciation: "I yagi piryohaeyo" },
    {
      phrase: "제네릭 있어요?",
      pronunciation: "Jenerik isseoyo?",
    },
    { phrase: "얼마에요?", pronunciation: "Eolmaeyo?" },
  ],
  ar: [
    {
      phrase: "أين أقرب صيدلية؟",
      pronunciation: "Ayna aqrab saydaliyya?",
    },
    {
      phrase: "أحتاج هذا الدواء",
      pronunciation: "Ahtaj hadha addawa'",
    },
    {
      phrase: "هل يوجد بديل عام؟",
      pronunciation: "Hal yujad badeel aam?",
    },
    { phrase: "كم الثمن؟", pronunciation: "Kam aththaman?" },
  ],
};

export async function detectCurrentCountry(): Promise<CountryInfo | null> {
  if (Platform.OS === "web") {
    try {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();
      const countryCode = data.country_code;
      return COUNTRIES[countryCode] || null;
    } catch {
      return null;
    }
  }

  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const [address] = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    if (address?.isoCountryCode) {
      return COUNTRIES[address.isoCountryCode] || null;
    }
    return null;
  } catch {
    return null;
  }
}

export interface TravelPriceComparison {
  medication: string;
  homePrice: { amount: number; currency: string; formatted: string };
  localPrice: { amount: number; currency: string; formatted: string };
  savings: { amount: number; percentage: number };
}

export function comparePrices(
  medicationPriceUSD: number,
  homeCurrency: string,
  destinationCurrency: string,
  localPriceMultiplier: number = 0.4,
): TravelPriceComparison {
  const homePrice = convertCurrency(medicationPriceUSD, "USD", homeCurrency);
  const localBasePrice = medicationPriceUSD * localPriceMultiplier;
  const localPrice = convertCurrency(
    localBasePrice,
    "USD",
    destinationCurrency,
  );
  const localPriceInHome = convertCurrency(localBasePrice, "USD", homeCurrency);
  const savings = homePrice - localPriceInHome;
  const savingsPercentage = (savings / homePrice) * 100;

  return {
    medication: "",
    homePrice: {
      amount: homePrice,
      currency: homeCurrency,
      formatted: formatCurrency(homePrice, homeCurrency),
    },
    localPrice: {
      amount: localPrice,
      currency: destinationCurrency,
      formatted: formatCurrency(localPrice, destinationCurrency),
    },
    savings: {
      amount: savings,
      percentage: Math.max(0, savingsPercentage),
    },
  };
}

export const TRAVEL_HEALTH_TIPS: Record<string, string[]> = {
  US: [
    "Healthcare costs are high - consider travel insurance",
    "Prescription medications may require a US doctor's prescription",
    "Emergency rooms are expensive for non-urgent care",
  ],
  UZ: [
    "Pharmacies often sell medications without prescription",
    "Many pharmacists speak Russian",
    "Carry your original prescription documentation",
  ],
  RU: [
    "Some Western medications may not be available",
    "Pharmacists can recommend alternatives",
    "Carry documentation for prescription medications",
  ],
  TR: [
    "Many medications are available without prescription",
    "Pharmacists are generally knowledgeable and helpful",
    "Istanbul has many English-speaking pharmacies",
  ],
  TH: [
    "Thailand is popular for medical tourism",
    "Bangkok hospitals have international patient services",
    "Many medications available over-the-counter",
  ],
  IN: [
    "Generic medications are very affordable",
    "Carry prescriptions for controlled substances",
    "International hospital chains offer quality care",
  ],
  MX: [
    "Border towns have pharmacies catering to tourists",
    "Generic versions widely available",
    "Some medications cheaper than US prices",
  ],
};
