# 📱 Radio Streaming Mobile App - Flutter

A professional Flutter mobile application for radio streaming with live audio playback, program schedules, and background audio support. This app serves as a **template** that gets cloned and customized for each radio station client.

![Flutter](https://img.shields.io/badge/Flutter-02569B?style=for-the-badge&logo=flutter&logoColor=white)
![Dart](https://img.shields.io/badge/Dart-0175C2?style=for-the-badge&logo=dart&logoColor=white)
![Android](https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)
![iOS](https://img.shields.io/badge/iOS-000000?style=for-the-badge&logo=ios&logoColor=white)

## ✨ Features

- **🎵 Live Radio Streaming** - High-quality audio streaming with multiple quality options
- **📋 Program Schedule** - Daily program listings with current show highlighting
- **🔊 Background Playback** - Continue listening while using other apps
- **📱 Media Notifications** - System notifications with playback controls
- **⚙️ Quality Settings** - Select streaming quality (High/Medium/Low)
- **🎨 Clean UI** - Modern Material Design interface
- **🔧 Environment Config** - Easy customization per station

## 🏗️ Architecture

This app follows **MVVM (Model-View-ViewModel)** architecture with **Repository Pattern** for clean separation of concerns:

### Layer Structure

**Domain Layer** (`lib/domain/`)
- **entities/**: Core business objects
  - `RadioProgram` - Program information entity
  - `StreamInfo` - Stream configuration entity
  - `NotificationSettings` - User preferences entity
- **repositories/**: Abstract repository interfaces
- **usecases/**: Business logic operations

**Data Layer** (`lib/data/`)
- **models/**: Data models with JSON serialization
- **datasources/**: Data source implementations
  - Local: SharedPreferences for user preferences
  - Remote: Mock data (to be replaced with real API)
- **repositories/**: Concrete repository implementations

**Presentation Layer** (`lib/presentation/`)
- **viewmodels/**: State management with ChangeNotifier
  - `RadioViewModel` - Radio player state
  - `ScheduleViewModel` - Program schedule state
  - `SettingsViewModel` - User settings state
- **views/**: Flutter screens
  - `RadioScreen` - Live radio player
  - `ScheduleScreen` - Program listings
  - `SettingsScreen` - App preferences
- **widgets/**: Reusable UI components

**Core Layer** (`lib/core/`)
- **services/**: Singleton services
  - `AudioPlayerService` - just_audio integration
  - `NotificationService` - Media notifications
  - `DependencyInjection` - Service wiring

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Flutter SDK** 3.8+ ([Install Flutter](https://flutter.dev/docs/get-started/install))
- **Dart SDK** 3.0+ (comes with Flutter)
- **Android Studio** (for Android development) or **Xcode** (for iOS development)
- **VS Code** or **Android Studio** with Flutter plugins
- **Git**

### Verify Installation

```bash
flutter doctor
```

This command checks your environment and displays a report. Make sure all required dependencies are installed.

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/radio-app.git
cd radio-app/mobile
```

### 2. Install Dependencies

```bash
flutter pub get
```

This downloads all required packages defined in `pubspec.yaml`.

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` file with your station's configuration:

```env
# App Configuration
APP_NAME=Your Radio Station FM
PACKAGE_NAME_ANDROID=com.yourstation.radio
PACKAGE_NAME_IOS=com.yourstation.radio

# API Configuration (Phase 7 - Backend Integration)
API_BASE_URL=https://api.yourplatform.com
API_KEY=your_station_api_key_here

# Stream URLs (currently used, will be fetched from API later)
STREAM_URL_HIGH=https://streaming.example.com/high
STREAM_URL_MEDIUM=https://streaming.example.com/medium
STREAM_URL_LOW=https://streaming.example.com/low

# Branding
PRIMARY_COLOR=#FF5733
LOGO_URL=https://cdn.example.com/logo.png

# Features
ENABLE_NOTIFICATIONS=true
ENABLE_BACKGROUND_PLAY=true
```

### 4. Run the App

**On Android Emulator/Device:**
```bash
flutter run
```

**On iOS Simulator/Device:**
```bash
flutter run
```

**On Specific Device:**
```bash
flutter devices  # List available devices
flutter run -d <device-id>
```

## 🛠️ Development Commands

### Essential Commands

```bash
# Install dependencies
flutter pub get

# Run the app
flutter run

# Run on specific device
flutter run -d <device-id>

# Hot reload (press 'r' in terminal while app is running)
# Hot restart (press 'R' in terminal)

# Run static analysis
flutter analyze

# Format code
dart format lib/

# Run tests
flutter test

# Run tests with coverage
flutter test --coverage

# Clean build artifacts
flutter clean

# Upgrade dependencies
flutter pub upgrade
```

### Build Commands

**Android:**
```bash
# Debug APK
flutter build apk --debug

# Release APK
flutter build apk --release

# Release App Bundle (for Google Play)
flutter build appbundle --release

# Split APKs by ABI (smaller file sizes)
flutter build apk --split-per-abi
```

**iOS:**
```bash
# Debug build
flutter build ios --debug

# Release build
flutter build ios --release

# Build without code signing
flutter build ios --release --no-codesign
```

## 📁 Project Structure

```
lib/
├── core/
│   ├── config/
│   │   └── environment_config.dart    # Environment variables
│   └── services/
│       ├── audio_player_service.dart  # Audio streaming service
│       ├── notification_service.dart  # Media notifications
│       └── dependency_injection.dart  # DI container
│
├── data/
│   ├── datasources/
│   │   ├── radio_local_datasource.dart   # Local storage
│   │   └── radio_remote_datasource.dart  # API/mock data
│   ├── models/
│   │   ├── radio_program_model.dart   # Program data model
│   │   └── stream_info_model.dart     # Stream config model
│   └── repositories/
│       └── radio_repository_impl.dart # Repository implementation
│
├── domain/
│   ├── entities/
│   │   ├── radio_program.dart         # Program entity
│   │   └── stream_info.dart           # Stream entity
│   ├── repositories/
│   │   └── radio_repository.dart      # Repository interface
│   └── usecases/
│       ├── get_programs_usecase.dart  # Get programs logic
│       └── stream_radio_usecase.dart  # Streaming logic
│
├── presentation/
│   ├── viewmodels/
│   │   ├── radio_viewmodel.dart       # Radio player state
│   │   ├── schedule_viewmodel.dart    # Schedule state
│   │   └── settings_viewmodel.dart    # Settings state
│   ├── views/
│   │   ├── radio_screen.dart          # Radio player UI
│   │   ├── schedule_screen.dart       # Program schedule UI
│   │   └── settings_screen.dart       # Settings UI
│   └── widgets/
│       ├── main_navigation.dart       # Bottom navigation
│       ├── radio_controls.dart        # Player controls
│       └── program_card.dart          # Program list item
│
└── main.dart                          # App entry point
```

## 🔧 Configuration & Customization

### Template Workflow (For Each New Station)

When deploying for a new radio station:

1. **Clone the template repository**
   ```bash
   git clone <template-repo> new-station-app
   cd new-station-app/mobile
   ```

2. **Configure `.env` file** with station details
   - API key (from backend)
   - Stream URLs
   - Branding (colors, logo)
   - App name

3. **Update package identifiers**
   - **Android**: Edit `android/app/build.gradle`
     ```gradle
     defaultConfig {
         applicationId "com.newstation.radio"
     }
     ```
   - **iOS**: Open `ios/Runner.xcworkspace` in Xcode
     - Update Bundle Identifier in project settings

4. **Update `pubspec.yaml`**
   ```yaml
   name: new_station_radio
   description: New Station FM Radio App
   version: 1.0.0+1
   ```

5. **Replace assets** (logos, splash screens)
   - Update `assets/images/logo.png`
   - Update launcher icons
   - Update splash screens

6. **Build and distribute**
   ```bash
   flutter build apk --release     # Android
   flutter build ios --release     # iOS
   ```

### Updating Stream URLs

Stream URLs are currently in `.env` file, but in Phase 7 (backend integration), they will be fetched from the API:

**Current (Mock):**
```dart
// Hardcoded in environment config
streamUrlHigh: EnvironmentConfig.streamUrlHigh
```

**Future (API):**
```dart
// Fetched from /api/public/config
final config = await apiService.getStationConfig();
streamUrlHigh: config.streamUrls.high
```

## 📦 Key Dependencies

### Production Dependencies

```yaml
dependencies:
  # Audio
  just_audio: ^0.9.36              # Audio streaming and playback
  audio_service: ^0.18.12          # Background audio support

  # State Management
  provider: ^6.1.1                 # MVVM state management

  # Storage
  shared_preferences: ^2.2.2       # Local data persistence

  # Notifications
  flutter_local_notifications: ^16.3.0  # Push notifications
  awesome_notifications: ^0.8.2    # Rich notifications

  # Networking (Phase 7)
  dio: ^5.4.0                      # HTTP client (when API ready)

  # UI
  cached_network_image: ^3.3.1     # Image caching

  # Utilities
  intl: ^0.19.0                    # Date/time formatting
  flutter_dotenv: ^5.1.0           # Environment variables
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
flutter test

# Run tests with coverage
flutter test --coverage

# Run specific test file
flutter test test/viewmodels/radio_viewmodel_test.dart

# Watch mode (auto-rerun on changes)
flutter test --watch
```

### Test Structure

```
test/
├── viewmodels/
│   ├── radio_viewmodel_test.dart
│   ├── schedule_viewmodel_test.dart
│   └── settings_viewmodel_test.dart
├── usecases/
│   ├── get_programs_usecase_test.dart
│   └── stream_radio_usecase_test.dart
└── widgets/
    ├── radio_controls_test.dart
    └── program_card_test.dart
```

## 🔌 Backend Integration (Phase 7)

Currently, the app uses **mock data** in `RadioRemoteDataSourceImpl`. To integrate with the real backend:

### 1. Create API Service

**File:** `lib/core/services/api_service.dart`

```dart
import 'package:dio/dio.dart';

class ApiService {
  final Dio _dio;
  final String _apiKey;

  ApiService({required String baseUrl, required String apiKey})
      : _apiKey = apiKey,
        _dio = Dio(BaseOptions(baseUrl: baseUrl));

  Future<Map<String, dynamic>> getStationConfig() async {
    final response = await _dio.get(
      '/api/public/config',
      options: Options(headers: {'Authorization': 'Bearer $_apiKey'}),
    );
    return response.data;
  }

  Future<List<Map<String, dynamic>>> getSchedule(DateTime date) async {
    final response = await _dio.get(
      '/api/public/schedule',
      queryParameters: {'date': date.toIso8601String().split('T')[0]},
      options: Options(headers: {'Authorization': 'Bearer $_apiKey'}),
    );
    return List<Map<String, dynamic>>.from(response.data['programs']);
  }
}
```

### 2. Update Remote Data Source

**File:** `lib/data/datasources/radio_remote_datasource.dart`

Replace mock implementation with API calls:

```dart
class RadioRemoteDataSourceImpl implements RadioRemoteDataSource {
  final ApiService _apiService;

  RadioRemoteDataSourceImpl(this._apiService);

  @override
  Future<List<RadioProgramModel>> getPrograms(DateTime date) async {
    final data = await _apiService.getSchedule(date);
    return data.map((json) => RadioProgramModel.fromJson(json)).toList();
  }
}
```

### 3. Handle Suspension

In `RadioViewModel`, handle station suspension:

```dart
Future<void> loadStationConfig() async {
  final config = await _apiService.getStationConfig();

  if (config['station']['status'] == 'suspended') {
    state = RadioState.suspended;
    errorMessage = 'Station temporarily suspended. Contact administrator.';
    return;
  }

  // Load stream URLs from config
  _streamUrls = config['stream_urls'];
}
```

## 🐛 Troubleshooting

### Common Issues

**1. Build Fails**
```bash
flutter clean
flutter pub get
flutter build apk --debug
```

**2. Stream Not Playing**
- Check stream URL is accessible
- Verify internet connection
- Check Android network security config
- Test URL in browser or VLC

**3. Background Audio Not Working**
- **Android**: Verify `android:name="io.flutter.app.FlutterApplication"` in `AndroidManifest.xml`
- **iOS**: Check background modes in `Info.plist`

**4. Notifications Not Showing**
- **Android**: Check notification permissions in app settings
- **iOS**: Check notification permissions in device settings

**5. Hot Reload Not Working**
- Restart app completely: `flutter run`
- Check for syntax errors: `flutter analyze`

**6. Gradle Build Failed (Android)**
```bash
cd android
./gradlew clean
cd ..
flutter clean
flutter pub get
```

## 📱 Platform-Specific Setup

### Android

**Minimum SDK**: 21 (Android 5.0)

**Permissions** (already configured in `AndroidManifest.xml`):
- `INTERNET` - Network access
- `FOREGROUND_SERVICE` - Background playback
- `WAKE_LOCK` - Keep device awake during playback

**Network Security** (configured for HTTP streams):
- See `android/app/src/main/res/xml/network_security_config.xml`

### iOS

**Minimum iOS Version**: 12.0

**Capabilities** (already configured):
- Background Modes: Audio, AirPlay, Picture in Picture
- Network usage description in `Info.plist`

**Deployment** (when building for App Store):
1. Open `ios/Runner.xcworkspace` in Xcode
2. Select Team in Signing & Capabilities
3. Update Bundle Identifier
4. Archive and upload to App Store Connect

## 📈 Performance Optimization

- **Audio Caching**: just_audio handles stream buffering automatically
- **Image Caching**: cached_network_image reduces network requests
- **State Preservation**: IndexedStack keeps screens alive when switching tabs
- **Lazy Loading**: Program lists use ListView.builder for efficient rendering

## 🔒 Security Notes

- **API Keys**: Store in `.env` file, never commit to repository
- **HTTPS**: Use HTTPS for all API calls and stream URLs
- **Permissions**: Request only necessary permissions
- **Data Validation**: Validate all data from API before use

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **just_audio** - Audio playback
- **audio_service** - Background audio
- **Flutter Community** - Amazing packages and support

---

**Built with ❤️ for the radio streaming community**

**Current Status:** ✅ Fully functional with mock data | **Next Phase:** Phase 7 - Backend API integration
