# Local Market Price Checker App

A comprehensive full-stack mobile application for checking and comparing prices across local markets in Rwanda. The app covers multiple sectors including groceries, clothing, electronics, household items, and services.

## Features

### Mobile App (React Native)
- 🔍 **Search & Compare Prices**: Search products across markets and compare prices
- 📊 **Price Trends**: View price trends over time with visual charts
- ⭐ **Favorites**: Save favorite products for quick access
- 🔔 **Price Alerts**: Get notified when prices change significantly
- 📱 **Offline Support**: Access cached data when offline
- 🌍 **Multi-language**: Support for English and Kinyarwanda
- 📍 **Geolocation**: Find nearby markets based on your location
- 👤 **User Profiles**: Manage your account and preferences
- 📤 **Price Submissions**: Submit prices for products (crowdsourced)

### Admin Dashboard (Web)
- ✅ **Verify Submissions**: Review and verify price submissions
- 📈 **Analytics Dashboard**: View statistics and insights
- 🏪 **Market Management**: Manage markets and locations
- 📦 **Product Management**: Manage products and categories
- 👥 **User Management**: View and manage users

### Backend (Firebase)
- 🔐 **Authentication**: Secure user authentication
- 🔒 **Security Rules**: Role-based access control
- ⚡ **Cloud Functions**: Automated price alert checking
- 📊 **Firestore Database**: Real-time data synchronization
- 📸 **Storage**: Image storage for price submissions

## Tech Stack

### Mobile App
- **React Native** with Expo
- **TypeScript**
- **Firebase** (Auth, Firestore, Storage, Functions)
- **React Navigation**
- **React Native Paper** (UI components)

### Admin Dashboard
- **React** with TypeScript
- **Vite**
- **Firebase**
- **React Router**

### Backend
- **Firebase Cloud Functions**
- **Firestore** (NoSQL database)
- **Firebase Storage**
- **Firebase Authentication**

## Prerequisites

- Node.js 18+ and npm
- Firebase account
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for Android development) or Xcode (for iOS development)

## Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable the following services:
   - Authentication (Email/Password)
   - Firestore Database
   - Storage
   - Cloud Functions

4. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps"
   - Add a web app and copy the config object

### 2. Mobile App Setup

1. Navigate to the mobile app directory:
```bash
cd LocalMarketPriceChecker
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Create a `.env` file in the project root based on `.env.example`
   - Fill in the Expo public variables with your Firebase credentials:
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. Deploy Firestore Security Rules:
```bash
firebase deploy --only firestore:rules
```

5. Deploy Storage Rules:
```bash
firebase deploy --only storage:rules
```

6. Start the development server:
```bash
npm start
```

7. Run on your device:
   - Scan the QR code with Expo Go app (Android/iOS)
   - Or press `a` for Android emulator
   - Or press `i` for iOS simulator

### 3. Cloud Functions Setup

1. Install Firebase CLI globally:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in the project:
```bash
firebase init functions
```

4. Navigate to functions directory:
```bash
cd functions
npm install
```

5. Configure mailer credentials for OTP emails:
```bash
firebase functions:config:set mailer.user="your_email@example.com" mailer.pass="your_app_password" mailer.service="gmail" mailer.from="Local Market Price Checker <your_email@example.com>"
```
   - The SMTP account must allow transactional emails (consider SendGrid, Mailgun, etc.)

6. Deploy functions:
```bash
firebase deploy --only functions
```

### 4. Admin Dashboard Setup

1. Navigate to admin dashboard directory:
```bash
cd admin-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Open `src/firebase/config.ts`
   - Replace with your Firebase config (same as mobile app)

4. Start development server:
```bash
npm run dev
```

5. Open browser to `http://localhost:3001`

6. Build for production:
```bash
npm run build
```

## Project Structure

```
LocalMarketPriceChecker/
├── firebase/
│   └── config.ts              # Firebase configuration
├── services/                    # Business logic services
│   ├── authService.ts
│   ├── priceService.ts
│   ├── marketService.ts
│   ├── favoriteService.ts
│   └── alertService.ts
├── screens/                     # App screens
│   ├── HomeScreen.tsx
│   ├── SearchScreen.tsx
│   ├── SubmitPriceScreen.tsx
│   ├── FavoritesScreen.tsx
│   ├── ProfileScreen.tsx
│   └── AuthScreen.tsx
├── contexts/                    # React contexts
│   ├── AuthContext.tsx
│   └── LanguageContext.tsx
├── navigation/                  # Navigation setup
│   └── AppNavigator.tsx
├── types/                       # TypeScript types
│   └── index.ts
├── i18n/                        # Internationalization
│   └── index.ts
├── functions/                   # Cloud Functions
│   ├── index.js
│   └── package.json
├── admin-dashboard/             # Admin web dashboard
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── contexts/
│   └── package.json
├── firestore.rules             # Firestore security rules
├── storage.rules               # Storage security rules
└── package.json
```

## Database Schema

### Collections

- **users**: User accounts with roles (user, vendor, admin)
- **markets**: Market locations and information
- **categories**: Product categories
- **products**: Product information
- **prices**: Price entries (verified and unverified)
- **favorites**: User favorite products
- **alerts**: Price alert subscriptions
- **notifications**: Push notifications
- **auditLogs**: Admin action logs

## Security

- Role-based access control (RBAC)
- Firestore security rules enforce data access
- Storage rules protect file uploads
- Admin-only endpoints in Cloud Functions
- Input validation on all user inputs

## Features in Detail

### Price Submission
- Users can submit prices for products
- Submissions require verification by admins
- Supports image uploads and location tagging
- Automatic geolocation capture

### Price Alerts
- Users can set alerts for price changes
- Configurable threshold (increase/decrease/both)
- Automatic notifications via Cloud Functions
- Real-time price monitoring

### Multi-language Support
- English and Kinyarwanda
- Runtime language switching
- Persistent language preference

### Offline Support
- Firestore offline persistence
- Cached data available offline
- Automatic sync when online

## Deployment

### Mobile App
1. Build for production:
```bash
expo build:android
# or
expo build:ios
```

2. Submit to app stores:
   - Google Play Store (Android)
   - Apple App Store (iOS)

### Admin Dashboard
1. Build:
```bash
cd admin-dashboard
npm run build
```

2. Deploy to hosting:
   - Firebase Hosting
   - Vercel
   - Netlify
   - Or any static hosting service

### Cloud Functions
```bash
firebase deploy --only functions
```

## Environment Variables

Create a `.env` file (optional, for additional configuration):
```
FIREBASE_API_KEY=your_api_key
FIREBASE_PROJECT_ID=your_project_id
```

## Troubleshooting

### Common Issues

1. **Firebase connection errors**
   - Verify Firebase config is correct
   - Check internet connection
   - Ensure Firebase services are enabled

2. **Build errors**
   - Clear cache: `expo start -c`
   - Delete `node_modules` and reinstall
   - Check Node.js version (18+)

3. **Permission errors**
   - Verify Firestore rules are deployed
   - Check user role in Firestore
   - Ensure authentication is working

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Create an issue in the repository
- Contact the development team

## Acknowledgments

- Built for the Rwanda market
- Designed with user-friendliness and security in mind
- Supports local languages and markets

---

**Note**: Remember to replace all placeholder Firebase configuration values with your actual Firebase project credentials before running the application.
