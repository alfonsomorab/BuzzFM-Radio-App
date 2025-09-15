# Environment Setup Guide

This guide explains how to configure the radio app for different environments and deployments.

## Quick Start

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your specific configuration:
   ```bash
   nano .env
   ```

3. Install dependencies and run:
   ```bash
   flutter pub get
   flutter run
   ```

## Environment Variables

### App Configuration
- `APP_NAME`: The display name of your radio app (e.g., "My Radio Station")
- `APP_DESCRIPTION`: Description of your radio app
- `ANDROID_PACKAGE_NAME`: Android package identifier (e.g., "com.yourcompany.radioapp")
- `IOS_BUNDLE_ID`: iOS bundle identifier (e.g., "com.yourcompany.radioapp")

### API Configuration
- `API_BASE_URL`: Base URL for your backend API (if using external API)
- `API_KEY`: API key for authentication (if required)

### Streaming Configuration
Configure up to 3 quality levels (High, Medium, Low):

**High Quality Stream:**
- `STREAM_URL_HIGH`: High quality stream URL
- `STREAM_BITRATE_HIGH`: Bitrate in kbps (e.g., 320)
- `STREAM_QUALITY_HIGH`: Quality identifier ("high")

**Medium Quality Stream:**
- `STREAM_URL_MEDIUM`: Medium quality stream URL
- `STREAM_BITRATE_MEDIUM`: Bitrate in kbps (e.g., 128)
- `STREAM_QUALITY_MEDIUM`: Quality identifier ("medium")

**Low Quality Stream:**
- `STREAM_URL_LOW`: Low quality stream URL
- `STREAM_BITRATE_LOW`: Bitrate in kbps (e.g., 64)
- `STREAM_QUALITY_LOW`: Quality identifier ("low")

### App Settings
- `DEFAULT_STREAM_QUALITY`: Default quality to use ("high", "medium", or "low")
- `ENABLE_NOTIFICATIONS`: Enable push notifications (true/false)
- `ENABLE_BACKGROUND_PLAY`: Enable background audio playback (true/false)

### Development Settings
- `DEBUG_MODE`: Enable debug features (true/false)
- `LOG_LEVEL`: Logging level ("debug", "info", "warning", "error")

## Publishing Your Radio App

### Step 1: Configure Environment
1. Update all environment variables in `.env`
2. Ensure stream URLs are accessible and working
3. Set appropriate package names for Android and iOS

### Step 2: Update Package Names

**Android:**
1. Update `android/app/build.gradle.kts`:
   ```kotlin
   android {
       namespace = "your.package.name"
       defaultConfig {
           applicationId = "your.package.name"
       }
   }
   ```

**iOS:**
1. Open `ios/Runner.xcworkspace` in Xcode
2. Update Bundle Identifier in project settings
3. Update `CFBundleDisplayName` in `ios/Runner/Info.plist`

### Step 3: App Assets
1. Replace app icons in `android/app/src/main/res/` and `ios/Runner/Assets.xcassets/`
2. Update splash screen assets if needed
3. Update app name in relevant configuration files

### Step 4: Test Configuration
```bash
# Test debug build
flutter build apk --debug
flutter build ios --debug

# Test release build
flutter build apk --release
flutter build ios --release
```

### Step 5: Deploy
- **Android**: Upload APK/AAB to Google Play Console
- **iOS**: Archive and upload to App Store Connect using Xcode

## Example Configurations

### Internet Radio Station
```env
APP_NAME=Magic FM
STREAM_URL_HIGH=https://stream.magicfm.com/high
STREAM_URL_MEDIUM=https://stream.magicfm.com/medium
STREAM_BITRATE_HIGH=320
STREAM_BITRATE_MEDIUM=128
DEFAULT_STREAM_QUALITY=high
```

### Podcast Platform
```env
APP_NAME=My Podcast App
API_BASE_URL=https://api.mypodcast.com
API_KEY=your_podcast_api_key
STREAM_URL_HIGH=https://cdn.mypodcast.com/episodes
DEFAULT_STREAM_QUALITY=medium
```

## Environment File Security

⚠️ **Important Security Notes:**
- Never commit `.env` files to version control
- The `.env` file is already in `.gitignore`
- Use `.env.example` as a template for team members
- Store sensitive keys securely in production environments

## Troubleshooting

### Common Issues

**1. Environment variables not loading:**
- Ensure `.env` file is in the project root
- Check that `flutter_dotenv` is added to `pubspec.yaml`
- Verify `.env` is listed in `assets` section of `pubspec.yaml`

**2. Stream URLs not working:**
- Test URLs directly in a browser or media player
- Check for CORS issues if streaming from web
- Ensure URLs support the audio formats expected

**3. Build failures:**
- Run `flutter clean && flutter pub get`
- Check all environment variables are properly formatted
- Ensure no spaces around `=` in `.env` file

**4. Package name conflicts:**
- Ensure Android package name is unique
- Update both namespace and applicationId in Android
- Update iOS bundle identifier in Xcode project settings

For additional support, check the main project README or create an issue in the repository.