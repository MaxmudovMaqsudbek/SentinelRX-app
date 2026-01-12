# SentinelRX - Medication Scanner & Health Assistant

## Overview

SentinelRX is a cross-platform React Native mobile application that combines computer vision, AI-powered analysis, and health data management to help users identify medications, check drug interactions, and manage their medication schedules. The app is designed with accessibility in mind, requiring no authentication for immediate access while offering comprehensive medication tracking and safety features.

**Core Purpose:** Empower users (especially older adults and patients on multiple medications) to safely identify pills, avoid dangerous drug interactions, and maintain medication adherence through visual scanning, AI assistance, and gamification.

**Key Features:**
- Visual pill recognition using camera/image analysis
- Drug interaction checking with severity warnings
- Medication reminders and adherence tracking
- Pharmacy locator with price comparison and fraud detection
- Voice assistant for hands-free queries
- Gamification system with rewards for consistent adherence
- Family panel for caregiver monitoring
- Multi-language support (English, Uzbek, Russian)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** React Native 0.81.5 with Expo SDK 54
- **Rendering:** New Architecture enabled for improved performance
- **Type Safety:** TypeScript with strict mode enabled
- **Navigation:** React Navigation v7 with native stack and bottom tab navigators
- **State Management:** React hooks and local component state (no global state library)
- **Animations:** React Native Reanimated v4 for 60fps animations with spring physics
- **Styling:** StyleSheet API with centralized theme system supporting light/dark modes

**Navigation Structure:**
- 5-tab bottom navigation (Home, Interactions, Scanner, Pharmacy, Profile)
- Each tab contains a stack navigator for deep navigation
- Floating voice assistant button accessible from all screens
- Native iOS blur effects on tab bar and headers (platform-specific)

**UI Components:**
- Custom themed components (ThemedText, ThemedView) respecting system color scheme
- Reusable cards with spring animations (MedCard, PharmacyCard, ReminderCard)
- Screen wrappers handling safe areas and keyboard avoidance
- Material Design 3 inspired with medical color palette (green primary, severity-based accents)

**Key Design Patterns:**
- **Component Composition:** Atomic design with small, reusable components
- **Screen Containers:** Specialized scroll views (ScreenScrollView, ScreenKeyboardAwareScrollView) managing insets
- **Animation Pattern:** Shared values with spring configs for consistent feel across interactions
- **Error Handling:** Class-based ErrorBoundary with dev-mode stack traces
- **Platform Abstraction:** Conditional rendering for iOS/Android/Web differences

### Data Layer

**Local Storage:** AsyncStorage for all persistent data
- No backend server - fully offline-capable
- Key-value storage with JSON serialization
- Separated storage keys for different data domains

**Data Models:**
- **UserProfile:** Demographics, allergies, chronic conditions, preferences
- **Medication:** Scanned pill details with visual features and warnings
- **Reminder:** Medication schedule with frequency and adherence tracking
- **ScanHistory:** Timestamped pill scans with confidence scores
- **GamificationData:** Points, streaks, achievements, and level progression
- **FamilyMember:** Linked caregivers with invite codes
- **Settings:** App preferences (theme, language, notifications)

**Drug Database:**
- Comprehensive in-memory database (COMPREHENSIVE_DRUG_DATABASE) with 100+ medications
- Drug interaction matrix (EXTENDED_INTERACTIONS) with severity levels
- Search capabilities by name, generic name, or features
- Safety checking against user profile (pregnancy, allergies, age, conditions)

### AI & Computer Vision

**Pill Recognition Strategy:**
- Visual feature extraction from camera/uploaded images
- Shape, color, and imprint matching against drug database
- Confidence scoring based on feature matches
- Fallback to text-based search if visual match fails
- Mock CNN classification (placeholder for future ML model integration)

**Drug Interaction Analysis:**
- Rule-based interaction checking using interaction matrix
- AI-enhanced summaries and recommendations
- Risk level scoring (low/moderate/high/critical)
- Management advice for identified interactions
- Support for checking up to 40 drugs simultaneously (DrugBank API ready)

**Voice Assistant:**
- Text-based query processing (speech recognition placeholder)
- Intent detection for medication queries, reminders, and interactions
- Multi-language response generation (English, Uzbek, Russian)
- Context-aware responses based on user's medication history

**Price Anomaly Detection:**
- Statistical analysis of pharmacy pricing
- Fraud detection using price distribution and outlier detection
- Anomaly scoring with threshold-based flagging
- Warning system for suspiciously low/high prices

### Platform-Specific Adaptations

**iOS:**
- Blur effects on headers and tab bar using expo-blur
- SF Symbols support via expo-symbols (iOS 18+)
- Haptic feedback for interactions
- Edge-to-edge safe area handling

**Android:**
- Edge-to-edge display with Material You adaptive icons
- Platform-specific permissions (camera, microphone, location)
- Solid backgrounds instead of blur effects

**Web:**
- Fallback to standard ScrollView (no KeyboardAwareScrollView)
- Simplified navigation without native gestures
- Static rendering support with hydration

### Performance Optimizations

- **Animation:** Reanimated worklets running on UI thread
- **Navigation:** Native stack navigators for native performance
- **Images:** expo-image with caching and optimization
- **List Rendering:** FlatList with proper key extraction
- **Memo/Callback:** Strategic use of useFocusEffect and useCallback for screen lifecycle
- **Spring Physics:** Tuned spring configs (damping: 15, stiffness: 150) for snappy feel

### Accessibility & Localization

- Large font sizes following Material Design typography scale
- High contrast colors meeting WCAG standards
- Screen reader support through semantic components
- Multi-language support (English, Uzbek, Russian) at data layer
- Clear iconography with labels (Feather icons throughout)

### Error Handling & Resilience

- Error boundary catches rendering errors with dev/prod modes
- Fallback UI with restart capability
- Detailed error logging in development
- Graceful degradation for missing data (empty states)
- Permission request flows with explanatory UI

## External Dependencies

### Core Framework
- **expo (54.0.23):** Development platform and native module management
- **react-native (0.81.5):** Mobile framework
- **react (19.1.0):** UI library with new architecture

### Navigation
- **@react-navigation/native (7.1.8):** Navigation framework
- **@react-navigation/native-stack (7.3.16):** Native stack navigator
- **@react-navigation/bottom-tabs (7.4.0):** Tab navigation
- **react-native-screens (4.16.0):** Native screen optimization

### UI & Animation
- **react-native-reanimated (4.1.1):** High-performance animations
- **react-native-gesture-handler (2.28.0):** Touch handling
- **expo-blur (15.0.7):** iOS blur effects
- **expo-linear-gradient (15.0.7):** Gradient backgrounds
- **expo-haptics (15.0.7):** Tactile feedback
- **@expo/vector-icons (15.0.2):** Feather icon set

### Device Features
- **expo-camera (17.0.9):** Camera access for pill scanning
- **expo-image-picker (17.0.8):** Photo library access
- **expo-location (19.0.7):** Pharmacy location services
- **expo-clipboard (8.0.7):** Copy/paste functionality

### Storage & Data
- **@react-native-async-storage/async-storage (2.2.0):** Persistent key-value storage

### Utilities
- **react-native-safe-area-context (5.6.0):** Safe area insets
- **react-native-keyboard-controller (1.18.5):** Keyboard management
- **expo-constants (18.0.9):** App constants and environment

### Development Tools
- **TypeScript (~19.1.0):** Type safety
- **ESLint (9.25.0):** Code linting with Expo config
- **Prettier:** Code formatting
- **babel-plugin-module-resolver:** Path aliasing (@/ imports)

### Future Integration Points
- **DrugBank API:** Professional drug interaction data (currently using local database)
- **OpenAI API:** Enhanced conversational AI for voice assistant (currently mock)
- **ML Model:** CNN for visual pill recognition (currently feature-based matching)
- **Push Notifications:** Medication reminders (expo-notifications ready)
- **Analytics:** Usage tracking and health insights (placeholder in gamification)