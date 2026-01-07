# Tesseract Mobile App

React Native mobile application for Tesseract Warehouse Management System.

## Prerequisites

- Node.js 18+
- React Native CLI: `npm install -g react-native-cli`
- For Android: Android Studio and Android SDK
- For iOS: Xcode (macOS only)

## Initial Setup

Since this is a shell project, you'll need to initialize the native projects:

### Option 1: Use React Native CLI (Recommended)

```bash
cd mobile
npx react-native init Tesseract --template react-native-template-typescript --skip-install
```

Then copy the `src/App.tsx` and other source files to the new project.

### Option 2: Use Expo (Easier for development)

```bash
cd mobile
npx create-expo-app --template
```

## Running the App

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

### Start Metro Bundler
```bash
npm start
```

## Development

The app connects to the backend API at `http://localhost:3000` by default. For Android emulator, use `http://10.0.2.2:3000`. For iOS simulator, `localhost` works.

## Building

### Android
```bash
cd android
./gradlew assembleRelease
```

### iOS
```bash
cd ios
pod install
# Then build from Xcode
```
