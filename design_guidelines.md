# AI-Driven Medication & Pharmacy App - Design Guidelines

## Architecture Decisions

### Authentication
**No authentication required** - This app prioritizes ease-of-use and immediate access. However, include a comprehensive **Profile/Settings screen** with:
- User-customizable avatar (generate 3 medical-themed preset avatars: a pill capsule icon, a stethoscope icon, and a medical cross icon with gradient fills)
- Display name field for personalization
- Language selection (English, Uzbek, Russian) with auto-detection
- Currency preference for medical tourism mode
- App preferences: theme (light/dark), notification settings, measurement units
- Family/caregiver linking code generator (optional feature for sharing adherence data)

### Navigation Architecture
**Tab Navigation (5 tabs)** - The app has multiple distinct feature areas requiring easy switching:

Tab structure (left to right):
1. **Home** - Dashboard with recent scans, reminders, and gamification progress
2. **Interactions** - Drug interaction checker and safety alerts
3. **Scanner** (Center tab with elevated style) - Core pill recognition camera
4. **Pharmacy** - Map-based pharmacy locator with inventory
5. **Profile** - Settings, rewards, family panel

**Floating Action Button:** Voice assistant accessible from all tabs (bottom-right corner with microphone icon)

## Screen Specifications

### 1. Home Screen (Dashboard)
- **Purpose:** Quick access to medication status, reminders, and gamification progress
- **Layout:**
  - Transparent header with greeting "Good morning, [Name]" and notification bell (right button)
  - Scrollable main content area
  - Safe area insets: top = insets.top + Spacing.xl, bottom = tabBarHeight + Spacing.xl
- **Components:**
  - Today's medication card (list of scheduled doses with checkboxes)
  - Gamification progress bar with current points and next reward
  - Recent scans carousel (horizontal scroll of last 5 scanned pills)
  - Quick stats: adherence streak, pills scanned this week
  - Batch recall alert banner (if applicable, dismissible)
- **Visual hierarchy:** Cards with subtle elevation (shadowOpacity: 0.05), primary action colors for due medications

### 2. Scanner Screen (Camera)
- **Purpose:** Visual pill recognition using device camera
- **Layout:**
  - Full-screen camera view with AR overlay
  - Custom header with close button (left) and flash toggle (right), transparent background
  - Safe area insets: top = insets.top + Spacing.md, bottom = Spacing.xxl
- **Components:**
  - Camera viewfinder with centered reticle for pill positioning
  - AR overlay highlighting detected pill edges
  - Capture button (large, centered at bottom with pill capsule icon)
  - Gallery access button (bottom-left for importing pill photos)
  - Real-time detection indicator (top: "Scanning..." or "Pill detected")
- **Floating elements:**
  - Results modal slides up from bottom after successful scan
  - Modal contains: pill name, dosage, manufacturer, safety warnings, interaction check button

### 3. Drug Interactions Screen
- **Purpose:** Multi-drug interaction analysis and safety checking
- **Layout:**
  - Default navigation header with title "Drug Interactions" and info button (right)
  - Scrollable form
  - Safe area insets: top = Spacing.xl, bottom = tabBarHeight + Spacing.xl
- **Components:**
  - Medication input section (add pills via scan or manual search)
  - List of added medications (each with delete swipe action)
  - "Check Interactions" primary button (below medication list)
  - Results section with severity badges (minor/moderate/major color-coded)
  - Expandable cards for each interaction with management advice
  - Personalized safety alerts section (age, pregnancy, allergies based on profile)

### 4. Pharmacy Locator Screen
- **Purpose:** Find verified pharmacies with real-time inventory
- **Layout:**
  - Transparent header with search bar and filter button (right)
  - Full-screen Mapbox map with bottom sheet overlay
  - Safe area insets: top = headerHeight + Spacing.md
- **Components:**
  - Interactive Mapbox map with pharmacy markers (color-coded: verified green, unverified gray)
  - Bottom sheet (draggable, 40% initial height) listing nearby pharmacies
  - Each pharmacy card: name, distance, walking time, inventory status, price, verification badge
  - Filter chips: 24/7, in-stock, verified only, price range
  - Directions button launches navigation
  - Price anomaly warning icon (red exclamation) for suspicious listings

### 5. Voice Assistant (Floating Modal)
- **Purpose:** Conversational medication queries via speech
- **Layout:**
  - Native modal from bottom (70% screen height)
  - Header with close button and language selector
  - Safe area insets: top = Spacing.xl, bottom = insets.bottom + Spacing.xl
- **Components:**
  - Animated waveform visualization during listening
  - Large microphone button (hold to speak, release to process)
  - Conversation history (chat bubbles: user on right, assistant on left)
  - Language indicator badge (UZ/EN/RU)
  - Auto-detect toggle in header
  - Speaker icon for playing TTS responses

### 6. Profile & Settings Screen
- **Purpose:** User preferences, gamification rewards, family panel
- **Layout:**
  - Default header with title "Profile"
  - Scrollable content
  - Safe area insets: top = Spacing.xl, bottom = tabBarHeight + Spacing.xl
- **Components:**
  - Avatar and name card at top (editable on tap)
  - Gamification section: total points, current level, progress to next tier, rewards catalog button
  - Settings sections:
    - Personal (age, pregnancy status, allergies, chronic conditions)
    - Preferences (language, currency, theme, units)
    - Notifications (reminders, recall alerts, family updates)
    - Family panel (linked caregivers, invite code generator)
  - About section (version, privacy policy, terms)

### 7. Medication Reminders Screen (Stack navigation from Home)
- **Purpose:** Schedule and track medication doses
- **Layout:**
  - Default header with title "Reminders" and add button (right)
  - Scrollable list
  - Safe area insets: top = Spacing.xl, bottom = tabBarHeight + Spacing.xl
- **Components:**
  - Calendar view (week view with today highlighted)
  - Daily dose list grouped by time
  - Each reminder card: medication name, dosage, time, checkbox for completion
  - Adherence calendar (monthly grid showing taken/missed doses)
  - Add reminder button opens modal form (medication, time, frequency, duration)

### 8. Rewards & Gamification Screen (Stack from Profile)
- **Purpose:** View achievements and redeem points
- **Layout:**
  - Custom header with gradient background showing current points balance
  - Scrollable content
  - Safe area insets: top = headerHeight + Spacing.xl, bottom = tabBarHeight + Spacing.xl
- **Components:**
  - Level progress bar with milestone markers
  - Achievement badges grid (unlocked/locked states)
  - Streaks section (current streak flame icon with day count)
  - Rewards catalog (cards with point cost, redemption button, description)
  - Activity log (recent point-earning actions)

## Design System

### Color Palette (Deep Ocean Theme)
**Primary:** #004575 (Deep Ocean Blue - Trust, calm, medical professionalism)
**Secondary:** #00A5B5 (Teal accent - Fresh, modern)
**Accent:** #FF7B54 (Warm coral - Attention, CTAs)
**Error:** #E53935 (Critical Red - Severe interactions, counterfeits)
**Success:** #00C853 (Confirmation Green)
**Warning:** #FFB300 (Alert Amber)
**Background:** #F8FAFC (Light), #0F172A (Dark)
**Surface:** #FFFFFF (Light), #1E293B (Dark)
**Text Primary:** #1A2B3C (Light), #F1F5F9 (Dark)
**Text Secondary:** #5A6B7C (Light), #94A3B8 (Dark)

### Typography (Accessibility-focused)
- **Display:** 32pt, Bold (screen titles)
- **Headline:** 24pt, Semibold (section headers)
- **Title:** 20pt, Medium (card titles)
- **Body:** 18pt, Regular (main content - larger for readability)
- **Small:** 14pt, Regular (secondary text)
- **Caption:** 12pt, Regular (helper text)
- **Label:** 16pt, Medium (buttons, labels)

### Spacing Scale
- xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32

### Component Styles
**Cards:** 
- Background: surface color
- Border radius: 16
- Padding: Spacing.lg
- Subtle elevation: shadowOpacity 0.05, shadowRadius 4, shadowOffset {width: 0, height: 2}

**Buttons (Primary):**
- Background: primary color
- Border radius: 12
- Padding: {vertical: 14, horizontal: 24}
- Label: 16pt medium
- Press state: opacity 0.8

**Floating Action Button (Voice Assistant):**
- Size: 56x56
- Background: secondary color
- Border radius: 28
- Icon: microphone (Feather)
- Shadow: shadowOpacity 0.10, shadowRadius 2, shadowOffset {width: 0, height: 2}

**Interaction Severity Badges:**
- Minor: background #FFF3E0, text #E65100
- Moderate: background #FFE0B2, text #EF6C00
- Major: background #FFCDD2, text #C62828

### Icons
- Use Feather icons from @expo/vector-icons exclusively
- Common icons: camera, pill (circle), map-pin, mic, bell, settings, check-circle, alert-triangle
- Icon size: 24 for inline, 32 for headers, 48 for primary actions

### Critical Assets to Generate
1. **Pill Recognition Demo:** 3 sample pill images (different shapes: round tablet, oval capsule, oblong pill) for onboarding/tutorial
2. **Profile Avatars:** 3 medical-themed preset avatars (capsule, stethoscope, medical cross with gradients)
3. **Pharmacy Verification Badge:** Green checkmark shield icon for verified pharmacies
4. **Gamification Achievements:** 6 badge icons (first scan, 7-day streak, 10 reports, 50 scans, interaction detective, medication master)
5. **Empty States:** Illustrations for no scans yet, no interactions found, no nearby pharmacies

### Accessibility
- Minimum touch target: 44x44 (iOS) / 48x48 (Android)
- Color contrast ratio: 4.5:1 for text, 3:1 for UI elements
- Support system font scaling up to 200%
- Screen reader labels for all interactive elements
- High contrast mode option in settings
- Haptic feedback for scan success, interaction warnings, reminder alerts