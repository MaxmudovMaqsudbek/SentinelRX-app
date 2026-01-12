/* eslint-disable prettier/prettier */
type Language = "en" | "uz" | "ru";

type TranslationKeys = {
  common: {
    appName: string;
    loading: string;
    save: string;
    cancel: string;
    done: string;
    delete: string;
    edit: string;
    add: string;
    search: string;
    back: string;
    next: string;
    confirm: string;
    error: string;
    success: string;
    retry: string;
    enable: string;
    disable: string;
    settings: string;
    openSettings: string;
    permissionRequired: string;
  };
  tabs: {
    home: string;
    interactions: string;
    scanner: string;
    pharmacy: string;
    profile: string;
  };
  home: {
    greeting: string;
    quickActions: string;
    scanPill: string;
    checkInteractions: string;
    findPharmacy: string;
    reminders: string;
    recentScans: string;
    noScans: string;
    todayReminders: string;
    noReminders: string;
    viewAll: string;
    confidence: string;
    taken: string;
    markTaken: string;
    upcomingReminder: string;
    gamification: string;
    points: string;
    streak: string;
    days: string;
    level: string;
  };
  scanner: {
    title: string;
    positionPill: string;
    scanning: string;
    capture: string;
    gallery: string;
    flash: string;
    cameraPermission: string;
    enableCamera: string;
    scanResult: string;
    confidence: string;
    warnings: string;
    sideEffects: string;
    manufacturer: string;
    dosage: string;
    alternatives: string;
    webFallback: string;
    simulateScan: string;
  };
  interactions: {
    title: string;
    subtitle: string;
    searchMedications: string;
    fromScans: string;
    selectedMedications: string;
    noMedications: string;
    addAtLeastTwo: string;
    checkInteractions: string;
    checking: string;
    riskLevel: string;
    low: string;
    moderate: string;
    high: string;
    critical: string;
    interactionsFound: string;
    noInteractions: string;
    recommendations: string;
    aiAnalysis: string;
    management: string;
    commonMedications: string;
    searchAll: string;
    readyToCheck: string;
    medicationsSelected: string;
    analyzingWithAI: string;
    addMore: string;
    // New keys
    analysisDetails: string;
    clinicalReport: string;
    noMedicationsSelected: string;
  };
  pharmacy: {
    title: string;
    searchPharmacies: string;
    nearbyPharmacies: string;
    all: string;
    verified: string;
    open24Hours: string;
    inStock: string;
    outOfStock: string;
    getDirections: string;
    enableLocation: string;
    locationRequired: string;
    distance: string;
    walkingTime: string;
    priceAlert: string;
    fairPrice: string;
    counterfeitRisk: string;
    verifyPrice: string;
    typicalPrice: string;
    aiScore: string;
    loadingData: string;
    enableLocationServices: string;
    locationExplanation: string;
    skipForNow: string;
    useDefaultLocation: string;
    searchByNameAddress: string;
    noPharmaciesFound: string;
    clearFilters: string;
    tapForLocation: string;
  };
  profile: {
    title: string;
    displayName: string;
    age: string;
    pregnancyStatus: string;
    pregnancyHint: string;
    allergies: string;
    allergiesHint: string;
    allergiesPlaceholder: string;
    chronicConditions: string;
    conditionsPlaceholder: string;
    language: string;
    currency: string;
    notifications: string;
    allNotifications: string;
    medicationReminders: string;
    recallAlerts: string;
    familyUpdates: string;
    accessibility: string;
    highContrastMode: string;
    theme: string;
    light: string;
    dark: string;
    system: string;
    medicalTourismMode: string;
    travelMode: string;
    travelModeHint: string;
    autoTranslate: string;
    autoTranslateHint: string;
    saveChanges: string;
    rewards: string;
    familyPanel: string;
    travel: string;
    myMedications: string;
    scanHistory: string;
    achievements: string;
    // New keys
    profileComplete: string;
    currentStreak: string;
    daysStreak: string;
    rewardsAchievements: string;
    personalInformation: string;
    languageCurrency: string;
    healthInformation: string;
    notSet: string;
    noneSpecified: string;
    version: string;
    privacyPolicy: string;
    termsOfService: string;
    logout: string;
  };
  reminders: {
    title: string;
    addReminder: string;
    medication: string;
    time: string;
    frequency: string;
    daily: string;
    weekly: string;
    monthly: string;
    asNeeded: string;
    enabled: string;
    disabled: string;
    noReminders: string;
    adherenceCalendar: string;
    thisWeek: string;
    thisMonth: string;
    adherence: string;
    taken: string;
    missed: string;
    noRemindersYet: string;
    addReminderDescription: string;
    medicationName: string;
    dosage: string;
    enterCustomTime: string;
    enableNotifications: string;
    enableNotificationsDesc: string;
    // New keys
    adherenceOverview: string;
    todaysMedications: string;
    dayStreak: string;
    best: string;
    dosesTaken: string;
    allTaken: string;
    partial: string;
  };
  voice: {
    title: string;
    listening: string;
    tapToSpeak: string;
    processing: string;
    speakNow: string;
    noMicPermission: string;
    enableMic: string;
    voiceResponse: string;
  };
  family: {
    title: string;
    inviteCode: string;
    copyCode: string;
    codeCopied: string;
    addMember: string;
    memberName: string;
    relationship: string;
    connected: string;
    pending: string;
    adherenceOverview: string;
    weeklyAdherence: string;
    monthlyAdherence: string;
    currentStreak: string;
    longestStreak: string;
    totalMedications: string;
    noMembers: string;
  };
  travel: {
    title: string;
    currentLocation: string;
    detecting: string;
    selectDestination: string;
    currencyConversion: string;
    medicationTranslations: string;
    pharmacyPhrases: string;
    emergencyNumber: string;
    healthTips: string;
    speakPhrase: string;
    copyPhrase: string;
    copied: string;
  };
  errors: {
    appCrashed: string;
    restartApp: string;
    somethingWentWrong: string;
    tryAgain: string;
    networkError: string;
    permissionDenied: string;
  };
};

const translations: Record<Language, TranslationKeys> = {
  en: {
    common: {
      appName: "SentinelRX",
      loading: "Loading...",
      save: "Save",
      cancel: "Cancel",
      done: "Done",
      delete: "Delete",
      edit: "Edit",
      add: "Add",
      search: "Search",
      back: "Back",
      next: "Next",
      confirm: "Confirm",
      error: "Error",
      success: "Success",
      retry: "Retry",
      enable: "Enable",
      disable: "Disable",
      settings: "Settings",
      openSettings: "Open Settings",
      permissionRequired: "Permission Required",
    },
    tabs: {
      home: "Home",
      interactions: "Interactions",
      scanner: "Scan",
      pharmacy: "Pharmacy",
      profile: "Profile",
    },
    home: {
      greeting: "Welcome back",
      quickActions: "Quick Actions",
      scanPill: "Scan Pill",
      checkInteractions: "Check Interactions",
      findPharmacy: "Find Pharmacy",
      reminders: "Reminders",
      recentScans: "Recent Scans",
      noScans: "No scans yet. Tap the scan button to identify a pill.",
      todayReminders: "Today's Reminders",
      noReminders: "No reminders for today",
      viewAll: "View All",
      confidence: "Confidence",
      taken: "Taken",
      markTaken: "Mark as Taken",
      upcomingReminder: "Upcoming Reminder",
      gamification: "Your Progress",
      points: "Points",
      streak: "Streak",
      days: "days",
      level: "Level",
    },
    scanner: {
      title: "Pill Scanner",
      positionPill: "Position the pill inside the frame",
      scanning: "Scanning...",
      capture: "Capture",
      gallery: "Gallery",
      flash: "Flash",
      cameraPermission: "Camera access is required to scan pills",
      enableCamera: "Enable Camera",
      scanResult: "Scan Result",
      confidence: "Match Confidence",
      warnings: "Warnings",
      sideEffects: "Side Effects",
      manufacturer: "Manufacturer",
      dosage: "Dosage",
      alternatives: "Similar Medications",
      webFallback:
        "Camera not available on web. Use the gallery or run in Expo Go.",
      simulateScan: "Simulate Scan",
    },
    interactions: {
      title: "Drug Interactions",
      subtitle: "Add medications to check for potential drug interactions",
      searchMedications: "Search medications...",
      fromScans: "From Your Scans",
      selectedMedications: "Selected Medications",
      noMedications: "No medications selected",
      addAtLeastTwo: "Add at least 2 medications to check interactions",
      checkInteractions: "Check Interactions",
      checking: "Checking...",
      riskLevel: "Risk Level",
      low: "Low",
      moderate: "Moderate",
      high: "High",
      critical: "Critical",
      interactionsFound: "Interactions Found",
      noInteractions: "No known interactions found between these medications",
      recommendations: "Recommendations",
      aiAnalysis: "AI Analysis",
      management: "Management",
      commonMedications: "Common Medications",
      searchAll: "Search All Medications",
      readyToCheck: "Ready to Check",
      medicationsSelected: "medications selected",
      analyzingWithAI: "Analyzing with AI...",
      addMore: "Add more medication to check interactions",
      analysisDetails: "Analysis Details",
      clinicalReport: "Clinical Report (PDF)",
      noMedicationsSelected: "No medications selected",
    },
    pharmacy: {
      title: "Find Pharmacy",
      searchPharmacies: "Search pharmacies...",
      nearbyPharmacies: "Nearby Pharmacies",
      all: "All",
      verified: "Verified",
      open24Hours: "24/7",
      inStock: "In Stock",
      outOfStock: "Out of Stock",
      getDirections: "Get Directions",
      enableLocation: "Enable Location",
      locationRequired: "Enable location to see nearby pharmacies on the map",
      distance: "Distance",
      walkingTime: "Walking",
      priceAlert: "Price Alert",
      fairPrice: "Fair Price",
      counterfeitRisk: "Counterfeit Risk",
      verifyPrice: "Verify Price",
      typicalPrice: "Typical",
      aiScore: "AI Score",
      loadingData: "Loading pharmacy data...",
      enableLocationServices: "Enable Location Services",
      locationExplanation: "Allow location access to find pharmacies near you, get directions, and see real-time distances.",
      skipForNow: "Skip for now",
      useDefaultLocation: "use default location",
      searchByNameAddress: "Search by name or address...",
      noPharmaciesFound: "No pharmacies found",
      clearFilters: "Clear Filters",
      tapForLocation: "Tap to use your current location for accurate distances",
    },
    profile: {
      title: "Profile",
      displayName: "Display Name",
      age: "Age",
      pregnancyStatus: "Pregnancy Status",
      pregnancyHint: "Enable for pregnancy-safe medication recommendations",
      allergies: "Allergies",
      allergiesHint: "Separate multiple allergies with commas",
      allergiesPlaceholder: "e.g., Penicillin, Aspirin",
      chronicConditions: "Chronic Conditions",
      conditionsPlaceholder: "e.g., Diabetes, Hypertension",
      language: "Language",
      currency: "Currency",
      notifications: "Notifications",
      allNotifications: "All Notifications",
      medicationReminders: "Medication Reminders",
      recallAlerts: "Recall Alerts",
      familyUpdates: "Family Updates",
      accessibility: "Accessibility",
      highContrastMode: "High Contrast Mode",
      theme: "Theme",
      light: "Light",
      dark: "Dark",
      system: "System",
      medicalTourismMode: "Medical Tourism Mode",
      travelMode: "Travel Mode",
      travelModeHint: "Auto-detect location and show local info",
      autoTranslate: "Auto-Translate Medications",
      autoTranslateHint: "Show medication names in local language",
      saveChanges: "Save Changes",
      rewards: "Rewards",
      familyPanel: "Family Panel",
      travel: "Travel Mode",
      myMedications: "My Medications",
      scanHistory: "Scan History",
      achievements: "Achievements",
      profileComplete: "Profile Complete",
      currentStreak: "Current Streak",
      daysStreak: "days streak",
      rewardsAchievements: "Rewards & Achievements",
      personalInformation: "Personal Information",
      languageCurrency: "Language & Currency",
      healthInformation: "Health Information",
      notSet: "Not set",
      noneSpecified: "None specified",
      version: "Version",
      privacyPolicy: "Privacy Policy",
      termsOfService: "Terms of Service",
      logout: "Logout",
    },
    reminders: {
      title: "Reminders",
      addReminder: "Add Reminder",
      medication: "Medication",
      time: "Time",
      frequency: "Frequency",
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      asNeeded: "As Needed",
      enabled: "Enabled",
      disabled: "Disabled",
      noReminders: "No reminders set. Add one to track your medications.",
      adherenceCalendar: "Adherence Calendar",
      thisWeek: "This Week",
      thisMonth: "This Month",
      adherence: "Adherence",
      taken: "Taken",
      missed: "Missed",
      noRemindersYet: "No Reminders Yet",
      addReminderDescription: "Add medication reminders to stay on track with your treatment",
      medicationName: "Medication Name",
      dosage: "Dosage",
      enterCustomTime: "Or enter custom time:",
      enableNotifications: "Enable Notifications",
      enableNotificationsDesc: "Get reminded when it's time to take your medications",
      adherenceOverview: "Adherence Overview",
      todaysMedications: "Today's Medications",
      dayStreak: "day streak",
      best: "Best",
      dosesTaken: "doses taken",
      allTaken: "All Taken",
      partial: "Partial",
    },
    voice: {
      title: "Voice Assistant",
      listening: "Listening...",
      tapToSpeak: "Tap to speak",
      processing: "Processing...",
      speakNow: "Speak now",
      noMicPermission: "Microphone access is required for voice commands",
      enableMic: "Enable Microphone",
      voiceResponse: "Voice Response",
    },
    family: {
      title: "Family Panel",
      inviteCode: "Your Invite Code",
      copyCode: "Copy Code",
      codeCopied: "Code copied!",
      addMember: "Add Family Member",
      memberName: "Member Name",
      relationship: "Relationship",
      connected: "Connected",
      pending: "Pending",
      adherenceOverview: "Adherence Overview",
      weeklyAdherence: "Weekly Adherence",
      monthlyAdherence: "Monthly Adherence",
      currentStreak: "Current Streak",
      longestStreak: "Longest Streak",
      totalMedications: "Total Medications",
      noMembers: "No family members added yet",
    },
    travel: {
      title: "Travel Mode",
      currentLocation: "Current Location",
      detecting: "Detecting your location...",
      selectDestination: "Select Destination",
      currencyConversion: "Currency Conversion",
      medicationTranslations: "Medication Translations",
      pharmacyPhrases: "Pharmacy Phrases",
      emergencyNumber: "Emergency Number",
      healthTips: "Health Tips",
      speakPhrase: "Speak",
      copyPhrase: "Copy",
      copied: "Copied!",
    },
    errors: {
      appCrashed: "SentinelRX needs a restart",
      restartApp: "Restart SentinelRX",
      somethingWentWrong:
        "Something unexpected happened. Please restart the app to continue managing your medications safely.",
      tryAgain: "Try Again",
      networkError: "Network error. Please check your connection.",
      permissionDenied: "Permission denied. Please enable in Settings.",
    },
  },
  uz: {
    common: {
      appName: "SentinelRX",
      loading: "Yuklanmoqda...",
      save: "Saqlash",
      cancel: "Bekor qilish",
      done: "Tayyor",
      delete: "O'chirish",
      edit: "Tahrirlash",
      add: "Qo'shish",
      search: "Qidirish",
      back: "Orqaga",
      next: "Keyingi",
      confirm: "Tasdiqlash",
      error: "Xatolik",
      success: "Muvaffaqiyat",
      retry: "Qayta urinish",
      enable: "Yoqish",
      disable: "O'chirish",
      settings: "Sozlamalar",
      openSettings: "Sozlamalarni ochish",
      permissionRequired: "Ruxsat kerak",
    },
    tabs: {
      home: "Bosh sahifa",
      interactions: "Ta'sirlar",
      scanner: "Skanerlash",
      pharmacy: "Dorixona",
      profile: "Profil",
    },
    home: {
      greeting: "Xush kelibsiz",
      quickActions: "Tezkor harakatlar",
      scanPill: "Tabletkani skanerlash",
      checkInteractions: "Ta'sirlarni tekshirish",
      findPharmacy: "Dorixona topish",
      reminders: "Eslatmalar",
      recentScans: "Oxirgi skanerlashlar",
      noScans:
        "Hali skanerlash yo'q. Tabletkani aniqlash uchun skanerlash tugmasini bosing.",
      todayReminders: "Bugungi eslatmalar",
      noReminders: "Bugun uchun eslatmalar yo'q",
      viewAll: "Hammasini ko'rish",
      confidence: "Ishonch darajasi",
      taken: "Qabul qilindi",
      markTaken: "Qabul qilindi deb belgilash",
      upcomingReminder: "Kelgusi eslatma",
      gamification: "Sizning taraqqiyotingiz",
      points: "Ballar",
      streak: "Ketma-ketlik",
      days: "kun",
      level: "Daraja",
    },
    scanner: {
      title: "Tabletka skaneri",
      positionPill: "Tabletkani ramka ichiga joylashtiring",
      scanning: "Skanerlanmoqda...",
      capture: "Suratga olish",
      gallery: "Galereya",
      flash: "Flash",
      cameraPermission: "Tabletkalarni skanerlash uchun kameraga ruxsat kerak",
      enableCamera: "Kamerani yoqish",
      scanResult: "Skanerlash natijasi",
      confidence: "Moslik darajasi",
      warnings: "Ogohlantirishlar",
      sideEffects: "Yon ta'sirlar",
      manufacturer: "Ishlab chiqaruvchi",
      dosage: "Dozasi",
      alternatives: "O'xshash dorilar",
      webFallback:
        "Veb-saytda kamera mavjud emas. Galereyadan foydalaning yoki Expo Go'da ishga tushiring.",
      simulateScan: "Skanerlashni simulyatsiya qilish",
    },
    interactions: {
      title: "Dori ta'sirlari",
      subtitle:
        "Dori-darmonlarning o'zaro ta'sirini tekshirish uchun dorilarni qo'shing",
      searchMedications: "Dorilarni qidirish...",
      fromScans: "Skanerlashlaringizdan",
      selectedMedications: "Tanlangan dorilar",
      noMedications: "Dori tanlanmagan",
      addAtLeastTwo: "Ta'sirlarni tekshirish uchun kamida 2 ta dori qo'shing",
      checkInteractions: "Ta'sirlarni tekshirish",
      checking: "Tekshirilmoqda...",
      riskLevel: "Xavf darajasi",
      low: "Past",
      moderate: "O'rtacha",
      high: "Yuqori",
      critical: "Jiddiy",
      interactionsFound: "Ta'sirlar topildi",
      noInteractions: "Bu dorilar o'rtasida ma'lum ta'sirlar topilmadi",
      recommendations: "Tavsiyalar",
      aiAnalysis: "Sun'iy intellekt tahlili",
      management: "Boshqarish",
      commonMedications: "Keng tarqalgan dorilar",
      searchAll: "Barcha dorilarni qidirish",
      readyToCheck: "Tekshirishga tayyor",
      medicationsSelected: "ta dori tanlandi",
      analyzingWithAI: "AI bilan tahlil qilinmoqda...",
      addMore: "Ta'sirlarni tekshirish uchun yana dori qo'shing",
      analysisDetails: "Tahlil tafsilotlari",
      clinicalReport: "Klinik hisobot (PDF)",
      noMedicationsSelected: "Dori tanlanmagan",
    },
    pharmacy: {
      title: "Dorixona topish",
      searchPharmacies: "Dorixonalarni qidirish...",
      nearbyPharmacies: "Yaqin atrofdagi dorixonalar",
      all: "Hammasi",
      verified: "Tasdiqlangan",
      open24Hours: "24/7",
      inStock: "Mavjud",
      outOfStock: "Mavjud emas",
      getDirections: "Yo'nalish olish",
      enableLocation: "Joylashuvni yoqish",
      locationRequired:
        "Xaritada yaqin dorixonalarni ko'rish uchun joylashuvni yoqing",
      distance: "Masofa",
      walkingTime: "Piyoda",
      priceAlert: "Narx ogohlantirishsi",
      fairPrice: "Adolatli narx",
      counterfeitRisk: "Soxta mahsulot xavfi",
      verifyPrice: "Narxni tekshiring",
      typicalPrice: "Odatiy narx",
      aiScore: "AI bahosi",
      loadingData: "Dorixona ma'lumotlari yuklanmoqda...",
      enableLocationServices: "Joylashuv xizmatlarini yoqish",
      locationExplanation: "Yaqin dorixonalarni topish, yo'nalish olish va masofani ko'rish uchun joylashuvga ruxsat bering.",
      skipForNow: "Hozircha o'tkazib yuborish",
      useDefaultLocation: "standart joylashuvdan foydalanish",
      searchByNameAddress: "Nom yoki manzil bo'yicha qidirish...",
      noPharmaciesFound: "Dorixonalar topilmadi",
      clearFilters: "Filtrlarni tozalash",
      tapForLocation: "Aniq masofa uchun joylashuvingizni yoqish uchun bosing",
    },
    profile: {
      title: "Profil",
      displayName: "Ism",
      age: "Yosh",
      pregnancyStatus: "Homiladorlik holati",
      pregnancyHint: "Homiladorlik uchun xavfsiz dori tavsiyalari uchun yoqing",
      allergies: "Allergiyalar",
      allergiesHint: "Bir nechta allergiyalarni vergul bilan ajrating",
      allergiesPlaceholder: "masalan, Penisilin, Aspirin",
      chronicConditions: "Surunkali kasalliklar",
      conditionsPlaceholder: "masalan, Diabet, Gipertoniya",
      language: "Til",
      currency: "Valyuta",
      notifications: "Bildirishnomalar",
      allNotifications: "Barcha bildirishnomalar",
      medicationReminders: "Dori eslatmalari",
      recallAlerts: "Qaytarish ogohlantirishlari",
      familyUpdates: "Oila yangilanishlari",
      accessibility: "Qulaylik",
      highContrastMode: "Yuqori kontrastli rejim",
      theme: "Mavzu",
      light: "Yorug'",
      dark: "Qorong'u",
      system: "Tizim",
      medicalTourismMode: "Tibbiy turizm rejimi",
      travelMode: "Sayohat rejimi",
      travelModeHint:
        "Joylashuvni avtomatik aniqlash va mahalliy ma'lumotlarni ko'rsatish",
      autoTranslate: "Dorilarni avtomatik tarjima qilish",
      autoTranslateHint: "Dori nomlarini mahalliy tilda ko'rsatish",
      saveChanges: "O'zgarishlarni saqlash",
      rewards: "Mukofotlar",
      familyPanel: "Oila paneli",
      travel: "Sayohat rejimi",
      myMedications: "Mening dorilarim",
      scanHistory: "Skanerlash tarixi",
      achievements: "Yutuqlar",
      profileComplete: "Profil to'ldirilgan",
      currentStreak: "Joriy ketma-ketlik",
      daysStreak: "kunlik ketma-ketlik",
      rewardsAchievements: "Mukofotlar va yutuqlar",
      personalInformation: "Shaxsiy ma'lumotlar",
      languageCurrency: "Til va valyuta",
      healthInformation: "Sog'liq ma'lumotlari",
      notSet: "O'rnatilmagan",
      noneSpecified: "Ko'rsatilmagan",
      version: "Versiya",
      privacyPolicy: "Maxfiylik siyosati",
      termsOfService: "Xizmat shartlari",
      logout: "Chiqish",
    },
    reminders: {
      title: "Eslatmalar",
      addReminder: "Eslatma qo'shish",
      medication: "Dori",
      time: "Vaqt",
      frequency: "Chastotasi",
      daily: "Kunlik",
      weekly: "Haftalik",
      monthly: "Oylik",
      asNeeded: "Kerak bo'lganda",
      enabled: "Yoqilgan",
      disabled: "O'chirilgan",
      noReminders:
        "Eslatmalar o'rnatilmagan. Dorilaringizni kuzatish uchun qo'shing.",
      adherenceCalendar: "Rioya taqvimi",
      thisWeek: "Bu hafta",
      thisMonth: "Bu oy",
      adherence: "Rioya",
      taken: "Qabul qilindi",
      missed: "O'tkazib yuborildi",
      noRemindersYet: "Hali eslatmalar yo'q",
      addReminderDescription: "Davolanishingizni kuzatish uchun dori eslatmalarini qo'shing",
      medicationName: "Dori nomi",
      dosage: "Doza",
      enterCustomTime: "Yoki boshqa vaqt kiriting:",
      enableNotifications: "Bildirishnomalarni yoqish",
      enableNotificationsDesc: "Dori qabul qilish vaqti kelganda eslatma oling",
      adherenceOverview: "Rioya ko'rinishi",
      todaysMedications: "Bugungi dorilar",
      dayStreak: "kunlik ketma-ketlik",
      best: "Eng yaxshi",
      dosesTaken: "dozalar qabul qilindi",
      allTaken: "Hammasi qabul qilindi",
      partial: "Qisman",
    },
    voice: {
      title: "Ovozli yordamchi",
      listening: "Tinglayapman...",
      tapToSpeak: "Gapirish uchun bosing",
      processing: "Qayta ishlanmoqda...",
      speakNow: "Hozir gapiring",
      noMicPermission: "Ovozli buyruqlar uchun mikrofonga ruxsat kerak",
      enableMic: "Mikrofonni yoqish",
      voiceResponse: "Ovozli javob",
    },
    family: {
      title: "Oila paneli",
      inviteCode: "Sizning taklif kodingiz",
      copyCode: "Kodni nusxalash",
      codeCopied: "Kod nusxalandi!",
      addMember: "Oila a'zosini qo'shish",
      memberName: "A'zo ismi",
      relationship: "Qarindoshlik",
      connected: "Ulangan",
      pending: "Kutilmoqda",
      adherenceOverview: "Rioya ko'rinishi",
      weeklyAdherence: "Haftalik rioya",
      monthlyAdherence: "Oylik rioya",
      currentStreak: "Joriy ketma-ketlik",
      longestStreak: "Eng uzun ketma-ketlik",
      totalMedications: "Jami dorilar",
      noMembers: "Hali oila a'zolari qo'shilmagan",
    },
    travel: {
      title: "Sayohat rejimi",
      currentLocation: "Joriy joylashuv",
      detecting: "Joylashuvingiz aniqlanmoqda...",
      selectDestination: "Manzilni tanlang",
      currencyConversion: "Valyuta konvertatsiyasi",
      medicationTranslations: "Dori tarjimalari",
      pharmacyPhrases: "Dorixona iboralari",
      emergencyNumber: "Tez yordam raqami",
      healthTips: "Sog'liq maslahatlari",
      speakPhrase: "Gapirish",
      copyPhrase: "Nusxalash",
      copied: "Nusxalandi!",
    },
    errors: {
      appCrashed: "SentinelRX qayta ishga tushirilishi kerak",
      restartApp: "SentinelRX'ni qayta ishga tushirish",
      somethingWentWrong:
        "Kutilmagan narsa yuz berdi. Dorilaringizni xavfsiz boshqarishni davom ettirish uchun ilovani qayta ishga tushiring.",
      tryAgain: "Qayta urinib ko'ring",
      networkError: "Tarmoq xatosi. Ulanishingizni tekshiring.",
      permissionDenied: "Ruxsat berilmadi. Sozlamalarda yoqing.",
    },
  },
  ru: {
    common: {
      appName: "SentinelRX",
      loading: "Загрузка...",
      save: "Сохранить",
      cancel: "Отмена",
      done: "Готово",
      delete: "Удалить",
      edit: "Редактировать",
      add: "Добавить",
      search: "Поиск",
      back: "Назад",
      next: "Далее",
      confirm: "Подтвердить",
      error: "Ошибка",
      success: "Успешно",
      retry: "Повторить",
      enable: "Включить",
      disable: "Отключить",
      settings: "Настройки",
      openSettings: "Открыть настройки",
      permissionRequired: "Требуется разрешение",
    },
    tabs: {
      home: "Главная",
      interactions: "Взаимодействия",
      scanner: "Сканер",
      pharmacy: "Аптека",
      profile: "Профиль",
    },
    home: {
      greeting: "С возвращением",
      quickActions: "Быстрые действия",
      scanPill: "Сканировать таблетку",
      checkInteractions: "Проверить взаимодействия",
      findPharmacy: "Найти аптеку",
      reminders: "Напоминания",
      recentScans: "Недавние сканирования",
      noScans:
        "Нет сканирований. Нажмите кнопку сканирования, чтобы определить таблетку.",
      todayReminders: "Напоминания на сегодня",
      noReminders: "Нет напоминаний на сегодня",
      viewAll: "Смотреть все",
      confidence: "Уверенность",
      taken: "Принято",
      markTaken: "Отметить как принятое",
      upcomingReminder: "Ближайшее напоминание",
      gamification: "Ваш прогресс",
      points: "Баллы",
      streak: "Серия",
      days: "дней",
      level: "Уровень",
    },
    scanner: {
      title: "Сканер таблеток",
      positionPill: "Расположите таблетку в рамке",
      scanning: "Сканирование...",
      capture: "Снять",
      gallery: "Галерея",
      flash: "Вспышка",
      cameraPermission: "Для сканирования таблеток требуется доступ к камере",
      enableCamera: "Включить камеру",
      scanResult: "Результат сканирования",
      confidence: "Уровень совпадения",
      warnings: "Предупреждения",
      sideEffects: "Побочные эффекты",
      manufacturer: "Производитель",
      dosage: "Дозировка",
      alternatives: "Похожие лекарства",
      webFallback:
        "Камера недоступна в браузере. Используйте галерею или запустите в Expo Go.",
      simulateScan: "Симулировать сканирование",
    },
    interactions: {
      title: "Взаимодействия лекарств",
      subtitle: "Добавьте лекарства для проверки потенциальных взаимодействий",
      searchMedications: "Поиск лекарств...",
      fromScans: "Из ваших сканирований",
      selectedMedications: "Выбранные лекарства",
      noMedications: "Лекарства не выбраны",
      addAtLeastTwo: "Добавьте минимум 2 лекарства для проверки взаимодействий",
      checkInteractions: "Проверить взаимодействия",
      checking: "Проверка...",
      riskLevel: "Уровень риска",
      low: "Низкий",
      moderate: "Умеренный",
      high: "Высокий",
      critical: "Критический",
      interactionsFound: "Найдены взаимодействия",
      noInteractions:
        "Известных взаимодействий между этими лекарствами не найдено",
      recommendations: "Рекомендации",
      aiAnalysis: "Анализ ИИ",
      management: "Управление",
      commonMedications: "Популярные лекарства",
      searchAll: "Поиск всех лекарств",
      readyToCheck: "Готово к проверке",
      medicationsSelected: "лекарств выбрано",
      analyzingWithAI: "Анализ с помощью ИИ...",
      addMore: "Добавьте ещё лекарства для проверки взаимодействий",
      analysisDetails: "Детали анализа",
      clinicalReport: "Клинический отчёт (PDF)",
      noMedicationsSelected: "Лекарства не выбраны",
    },
    pharmacy: {
      title: "Найти аптеку",
      searchPharmacies: "Поиск аптек...",
      nearbyPharmacies: "Ближайшие аптеки",
      all: "Все",
      verified: "Проверенные",
      open24Hours: "24/7",
      inStock: "В наличии",
      outOfStock: "Нет в наличии",
      getDirections: "Проложить маршрут",
      enableLocation: "Включить геолокацию",
      locationRequired:
        "Включите геолокацию, чтобы увидеть ближайшие аптеки на карте",
      distance: "Расстояние",
      walkingTime: "Пешком",
      priceAlert: "Предупреждение о цене",
      fairPrice: "Справедливая цена",
      counterfeitRisk: "Риск подделки",
      verifyPrice: "Проверьте цену",
      typicalPrice: "Типичная цена",
      aiScore: "Оценка ИИ",
      loadingData: "Загрузка данных аптек...",
      enableLocationServices: "Включить службы геолокации",
      locationExplanation: "Разрешите доступ к геолокации для поиска ближайших аптек, маршрутов и расстояний.",
      skipForNow: "Пропустить",
      useDefaultLocation: "использовать стандартное местоположение",
      searchByNameAddress: "Поиск по названию или адресу...",
      noPharmaciesFound: "Аптеки не найдены",
      clearFilters: "Сбросить фильтры",
      tapForLocation: "Нажмите для определения вашего местоположения",
    },
    profile: {
      title: "Профиль",
      displayName: "Имя",
      age: "Возраст",
      pregnancyStatus: "Статус беременности",
      pregnancyHint:
        "Включите для рекомендаций безопасных при беременности лекарств",
      allergies: "Аллергии",
      allergiesHint: "Разделите несколько аллергий запятыми",
      allergiesPlaceholder: "например, Пенициллин, Аспирин",
      chronicConditions: "Хронические заболевания",
      conditionsPlaceholder: "например, Диабет, Гипертония",
      language: "Язык",
      currency: "Валюта",
      notifications: "Уведомления",
      allNotifications: "Все уведомления",
      medicationReminders: "Напоминания о лекарствах",
      recallAlerts: "Оповещения об отзыве",
      familyUpdates: "Семейные обновления",
      accessibility: "Доступность",
      highContrastMode: "Режим высокой контрастности",
      theme: "Тема",
      light: "Светлая",
      dark: "Темная",
      system: "Системная",
      medicalTourismMode: "Режим медицинского туризма",
      travelMode: "Режим путешествия",
      travelModeHint:
        "Автоопределение местоположения и показ местной информации",
      autoTranslate: "Автоперевод лекарств",
      autoTranslateHint: "Показывать названия лекарств на местном языке",
      saveChanges: "Сохранить изменения",
      rewards: "Награды",
      familyPanel: "Семейная панель",
      travel: "Режим путешествия",
      myMedications: "Мои лекарства",
      scanHistory: "История сканирований",
      achievements: "Достижения",
      profileComplete: "Профиль заполнен",
      currentStreak: "Текущая серия",
      daysStreak: "дней подряд",
      rewardsAchievements: "Награды и достижения",
      personalInformation: "Личная информация",
      languageCurrency: "Язык и валюта",
      healthInformation: "Медицинская информация",
      notSet: "Не указано",
      noneSpecified: "Не указано",
      version: "Версия",
      privacyPolicy: "Политика конфиденциальности",
      termsOfService: "Условия использования",
      logout: "Выйти",
    },
    reminders: {
      title: "Напоминания",
      addReminder: "Добавить напоминание",
      medication: "Лекарство",
      time: "Время",
      frequency: "Частота",
      daily: "Ежедневно",
      weekly: "Еженедельно",
      monthly: "Ежемесячно",
      asNeeded: "По необходимости",
      enabled: "Включено",
      disabled: "Отключено",
      noReminders:
        "Напоминания не установлены. Добавьте, чтобы отслеживать лекарства.",
      adherenceCalendar: "Календарь приема",
      thisWeek: "Эта неделя",
      thisMonth: "Этот месяц",
      adherence: "Приверженность",
      taken: "Принято",
      missed: "Пропущено",
      noRemindersYet: "Напоминаний пока нет",
      addReminderDescription: "Добавьте напоминания о лекарствах для соблюдения режима лечения",
      medicationName: "Название лекарства",
      dosage: "Дозировка",
      enterCustomTime: "Или введите своё время:",
      enableNotifications: "Включить уведомления",
      enableNotificationsDesc: "Получайте напоминания, когда пора принимать лекарства",
      adherenceOverview: "Обзор приверженности",
      todaysMedications: "Лекарства на сегодня",
      dayStreak: "дней подряд",
      best: "Лучший",
      dosesTaken: "доз принято",
      allTaken: "Всё принято",
      partial: "Частично",
    },
    voice: {
      title: "Голосовой помощник",
      listening: "Слушаю...",
      tapToSpeak: "Нажмите, чтобы говорить",
      processing: "Обработка...",
      speakNow: "Говорите",
      noMicPermission: "Для голосовых команд требуется доступ к микрофону",
      enableMic: "Включить микрофон",
      voiceResponse: "Голосовой ответ",
    },
    family: {
      title: "Семейная панель",
      inviteCode: "Ваш код приглашения",
      copyCode: "Копировать код",
      codeCopied: "Код скопирован!",
      addMember: "Добавить члена семьи",
      memberName: "Имя члена семьи",
      relationship: "Родство",
      connected: "Подключен",
      pending: "Ожидание",
      adherenceOverview: "Обзор приверженности",
      weeklyAdherence: "Недельная приверженность",
      monthlyAdherence: "Месячная приверженность",
      currentStreak: "Текущая серия",
      longestStreak: "Самая длинная серия",
      totalMedications: "Всего лекарств",
      noMembers: "Члены семьи еще не добавлены",
    },
    travel: {
      title: "Режим путешествия",
      currentLocation: "Текущее местоположение",
      detecting: "Определение местоположения...",
      selectDestination: "Выберите направление",
      currencyConversion: "Конвертация валют",
      medicationTranslations: "Перевод лекарств",
      pharmacyPhrases: "Фразы для аптеки",
      emergencyNumber: "Номер экстренной помощи",
      healthTips: "Советы по здоровью",
      speakPhrase: "Произнести",
      copyPhrase: "Копировать",
      copied: "Скопировано!",
    },
    errors: {
      appCrashed: "SentinelRX требует перезапуска",
      restartApp: "Перезапустить SentinelRX",
      somethingWentWrong:
        "Произошла непредвиденная ошибка. Пожалуйста, перезапустите приложение, чтобы продолжить безопасное управление лекарствами.",
      tryAgain: "Попробовать снова",
      networkError: "Ошибка сети. Проверьте подключение.",
      permissionDenied: "Доступ запрещен. Включите в настройках.",
    },
  },
};

export function getTranslations(language: Language): TranslationKeys {
  return translations[language] || translations.en;
}

export function t(
  language: Language,
  section: keyof TranslationKeys,
  key: string,
): string {
  const trans = translations[language] || translations.en;
  const sectionData = trans[section] as Record<string, string>;
  return (
    sectionData?.[key] ||
    (translations.en[section] as Record<string, string>)?.[key] ||
    key
  );
}

export type { Language, TranslationKeys };
