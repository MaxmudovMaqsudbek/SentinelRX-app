# SentinelRX 💊

A modern, cross-platform medication management app built with React Native and Expo. SentinelRX helps users identify medications, check drug interactions, find nearby pharmacies, and manage medication schedules with AI-powered assistance.

![SentinelRX](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-blue)
![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020)
![React Native](https://img.shields.io/badge/React%20Native-0.76-61DAFB)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 📸 Pill Scanner
- AI-powered pill identification using camera
- Scan medications to get detailed information
- View drug details, dosages, and warnings

### ⚠️ Drug Interactions Checker
- Check interactions between multiple medications
- AI-powered analysis with severity ratings
- Comprehensive drug database with 100+ medications

### 🗺️ Pharmacy Finder
- Find nearby pharmacies with real-time location
- Filter by verified, 24/7, and in-stock status
- Get directions and view pharmacy details
- Price comparison across pharmacies

### ⏰ Medication Reminders
- Set customizable medication reminders
- Track medication adherence
- Calendar view for scheduling
- Push notifications support

### 🤖 AI Assistant
- Voice and text-based AI chatbot
- Ask questions about medications
- Get personalized health advice
- Multi-language support (English, Uzbek, Russian)

### 🎮 Gamification
- Earn points for healthy habits
- Track streaks and achievements
- Level up system to stay motivated

### 👨‍👩‍👧‍👦 Family Panel
- Manage medications for family members
- Share medication schedules
- Monitor adherence for loved ones

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Expo CLI** - Will be installed automatically
- **Expo Go app** (for mobile testing) - [iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MaxmudovMaqsudbek/SentinelRX-app.git
   cd SentinelRX-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```
   
   Get your free API key from [Groq Console](https://console.groq.com/)

### Running the App

#### 📱 On Mobile (Recommended)

```bash
npm start
```

Then scan the QR code with:
- **iOS**: Camera app or Expo Go
- **Android**: Expo Go app

#### 🌐 On Web

```bash
npm run web
```

Opens automatically at `http://localhost:8081`

#### 📱 On Android Emulator

```bash
npm run android
```

Requires Android Studio with an emulator configured.

#### 🍎 On iOS Simulator (macOS only)

```bash
npm run ios
```

Requires Xcode installed.

## 📖 How to Use

### 1. Home Screen
- View your daily medication schedule
- Check gamification progress and streaks
- Quick access to recent scans

### 2. Scanning Pills
1. Tap the **Scanner** tab (center button)
2. Allow camera permissions
3. Point camera at the pill
4. Get instant identification results

### 3. Checking Drug Interactions
1. Go to **Interactions** tab
2. Search and select medications
3. Tap "Check Interactions"
4. View AI-powered interaction analysis

### 4. Finding Pharmacies
1. Go to **Pharmacy** tab
2. Enable location services
3. Browse nearby pharmacies
4. Use filters (Verified, 24/7, In Stock)
5. Tap for directions

### 5. Setting Reminders
1. Go to **Home** → **Reminders**
2. Tap "Add Reminder"
3. Enter medication details
4. Set time and frequency
5. Enable notifications

### 6. Using AI Assistant
1. Tap the **AI button** (bottom right)
2. Type or speak your question
3. Get instant AI-powered responses
4. Change language if needed

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation v6
- **State Management**: React Context API
- **Storage**: AsyncStorage
- **AI**: Groq API (Llama 3)
- **Maps**: React Native Maps / Web Leaflet
- **Animations**: React Native Reanimated
- **Icons**: Expo Vector Icons (Feather)

## 📁 Project Structure

```
sentinelrx/
├── assets/              # Images, fonts, and static files
├── components/          # Reusable UI components
├── constants/           # Theme, colors, and constants
├── contexts/            # React Context providers
├── hooks/               # Custom React hooks
├── navigation/          # Navigation configuration
├── screens/             # App screens
├── utils/               # Utility functions and services
├── App.tsx              # Root component
├── app.json             # Expo configuration
└── package.json         # Dependencies
```

## 🌍 Supported Languages

- 🇺🇸 English
- 🇺🇿 O'zbek (Uzbek)
- 🇷🇺 Русский (Russian)

Change language in **Profile** → **Settings** → **Language**

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | API key for AI features | Yes |

### App Configuration

Edit `app.json` to customize:
- App name and slug
- Bundle identifiers
- Splash screen
- App icons

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Maqsudbek Maxmudov**

- GitHub: [@MaxmudovMaqsudbek](https://github.com/MaxmudovMaqsudbek)

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) for the amazing development platform
- [Groq](https://groq.com/) for fast AI inference
- [React Native](https://reactnative.dev/) community

---

<p align="center">
  Made with ❤️ for better medication management
</p>
