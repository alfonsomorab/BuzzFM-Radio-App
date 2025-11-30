# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Flutter radio streaming app built with MVVM architecture and Repository pattern. The app provides live radio streaming with three main screens: Radio (live player), Schedule (program listings), and Settings (user preferences).

## Development Commands

### Essential Commands
```bash
# Install dependencies
flutter pub get

# Run static analysis
flutter analyze

# Run tests
flutter test

# Build for Android debug
flutter build apk --debug

# Run on device/emulator
flutter run

# Clean build artifacts
flutter clean
```

## Architecture Overview

### MVVM + Repository Pattern
The app follows a layered architecture with clear separation of concerns:

**Domain Layer** (`lib/domain/`):
- `entities/`: Core business objects (RadioProgram, StreamInfo, NotificationSettings)
- `repositories/`: Abstract repository interfaces
- `usecases/`: Business logic operations

**Data Layer** (`lib/data/`):
- `models/`: Data models with JSON serialization extending domain entities
- `datasources/`: Local (SharedPreferences) and remote (mock) data sources
- `repositories/`: Concrete repository implementations

**Presentation Layer** (`lib/presentation/`):
- `viewmodels/`: MVVM view models using ChangeNotifier for state management
- `views/`: Flutter screens (RadioScreen, ScheduleScreen, SettingsScreen)
- `widgets/`: Reusable UI components

**Core Layer** (`lib/core/`):
- `services/`: Singleton services (AudioPlayerService, NotificationService, DependencyInjection)

### Key Services

**DependencyInjection**: Singleton service that wires up all dependencies. Must be initialized via `DependencyInjection().init()` before app startup.

**AudioPlayerService**: Manages radio streaming using just_audio package. Handles multiple stream URLs with quality selection.

**State Management**: Uses Provider pattern with ChangeNotifier-based ViewModels. Each screen has its own ViewModel that encapsulates business logic and state.

### Data Flow

1. Views consume ViewModels via Provider
2. ViewModels use UseCases to interact with business logic
3. UseCases call Repository interfaces
4. Repository implementations coordinate between local and remote data sources
5. Audio streaming is managed through the AudioPlayerService singleton

### Mock Data Implementation (Current)

Currently uses mock data in `RadioRemoteDataSourceImpl` with realistic program schedules and stream URLs:
- `https://streaming.hostpannel.lat:8012/stream`
- `https://streaming.hostpannel.lat:2020/public/magicafm`

**Status**: This will be replaced with real API integration in Phase 7.

### API Integration Plan (Phase 7)

The app will be updated to consume a real Next.js backend API. Here's how the integration will work:

#### API Service Layer
Create new file `lib/core/services/api_service.dart`:
```dart
class ApiService {
  final Dio _dio;
  final String _baseUrl;
  final String _apiKey;

  Future<Map<String, dynamic>> getStationConfig();
  Future<List<ProgramModel>> getSchedule(DateTime date);
  Future<void> logAnalytics(ListeningSession session);
}
```

#### Files to Modify

1. **Environment Config** (`lib/core/config/environment_config.dart`):
   - Add `API_BASE_URL` and `API_KEY` properties
   - Load from `.env` file

2. **Remote Data Source** (`lib/data/datasources/radio_remote_datasource.dart`):
   - Replace mock implementation with `ApiService` calls
   - Add proper error handling for network failures
   - Implement response caching for station config

3. **Dependency Injection** (`lib/core/services/dependency_injection.dart`):
   - Initialize `ApiService` with base URL and API key from config
   - Inject `ApiService` into `RadioRemoteDataSourceImpl`

4. **Radio ViewModel** (`lib/presentation/viewmodels/radio_viewmodel.dart`):
   - Add suspension state handling
   - Display "Station Temporarily Suspended" message when status = 'suspended'

5. **Environment File** (`.env`):
   ```
   API_BASE_URL=https://api.yourplatform.com
   API_KEY=generated_station_api_key_here
   APP_NAME=Your Station FM
   STREAM_URL_HIGH=will_be_fetched_from_api
   STREAM_URL_MEDIUM=will_be_fetched_from_api
   STREAM_URL_LOW=will_be_fetched_from_api
   ```

#### Backend API Endpoints

The mobile app will consume these public API endpoints:

**Get Station Configuration** (called on app startup):
```
GET /api/public/config
Headers: Authorization: Bearer {API_KEY}
Response: {
  station: { name, status, branding: { logo_url, primary_color } },
  stream_urls: { primary, backup },
  quality_options: { high, medium, low }
}
```

**Get Program Schedule**:
```
GET /api/public/schedule?date=2024-12-01
Headers: Authorization: Bearer {API_KEY}
Response: {
  programs: [
    { title, host_name, description, start_time, end_time, day_of_week }
  ]
}
```

**Log Analytics** (optional, for tracking):
```
POST /api/public/analytics
Headers: Authorization: Bearer {API_KEY}
Body: { session_duration, quality_used, timestamp }
```

#### Suspension Flow

When a station is suspended by admin:
1. Backend sets `status = 'suspended'` in database
2. Mobile app calls `/api/public/config` on startup
3. API returns `status: 'suspended'`
4. App shows suspension screen instead of radio player:
   ```
   "Oops! This station is temporarily suspended.
   Please contact your station administrator."
   ```

#### Error Handling

Add graceful handling for:
- **Network Errors**: Show "No Internet Connection" message, allow retry
- **Invalid API Key**: Show "Configuration Error" message
- **API Timeouts**: Retry with exponential backoff
- **Empty Schedule**: Show "No Programs Scheduled Today"

To replace with real backend, implement new data sources and update repository implementations.

### Key Dependencies

- **just_audio**: Audio streaming
- **provider**: State management
- **shared_preferences**: Local storage
- **flutter_local_notifications**: Push notifications
- **cached_network_image**: Image loading
- **intl**: Date/time formatting

### Navigation Structure

Bottom navigation with three tabs managed by `MainNavigation` widget using IndexedStack for state preservation across tab switches.

---

## Template Customization Workflow

This Flutter app serves as a **template** that gets cloned and customized for each new radio station. Here's the workflow:

### When Admin Onboards New Station

1. **Admin registers station in web dashboard**
   - System generates unique API key
   - Admin records station branding details (logo, colors, name)

2. **Admin clones mobile template repository**
   ```bash
   git clone <template-repo-url> station-name-app
   cd station-name-app
   ```

3. **Admin configures `.env` file**
   ```env
   APP_NAME=Magic FM 95.7
   API_KEY=abc123xyz789generated_key
   API_BASE_URL=https://api.radiostreamer.com

   # Branding (will be fetched from API but can override)
   PRIMARY_COLOR=#FF5733
   LOGO_URL=https://cdn.example.com/magicfm-logo.png

   # Stream URLs (will be fetched from API)
   STREAM_URL_HIGH=https://stream.magicfm.com/high
   STREAM_URL_MEDIUM=https://stream.magicfm.com/medium
   STREAM_URL_LOW=https://stream.magicfm.com/low
   ```

4. **Admin updates `pubspec.yaml`**
   - Change `name:` to match station (e.g., `magic_fm_app`)
   - Update `description:` with station details
   - Update version number

5. **Admin updates package identifiers**
   - **Android**: Update `applicationId` in `android/app/build.gradle`
   - **iOS**: Update Bundle Identifier in Xcode project settings

6. **Admin builds and distributes**
   ```bash
   # Android
   flutter build apk --release
   flutter build appbundle --release

   # iOS
   flutter build ios --release
   # Open Xcode for code signing and App Store upload
   ```

7. **Admin delivers to station client**
   - Upload to Google Play Store
   - Upload to Apple App Store
   - Or distribute directly (APK for Android, TestFlight for iOS)

### Environment Variables Reference

All configurable values in `.env`:

| Variable | Purpose | Example |
|----------|---------|---------|
| `APP_NAME` | App display name | `"Magic FM 95.7"` |
| `API_KEY` | Station's unique API key | `"abc123..."` |
| `API_BASE_URL` | Backend API endpoint | `"https://api.example.com"` |
| `PRIMARY_COLOR` | Station branding color | `"#FF5733"` |
| `LOGO_URL` | Station logo URL | `"https://..."` |
| `STREAM_URL_HIGH` | High quality stream | `"https://stream/high"` |
| `STREAM_URL_MEDIUM` | Medium quality stream | `"https://stream/med"` |
| `STREAM_URL_LOW` | Low quality stream | `"https://stream/low"` |
| `ENABLE_NOTIFICATIONS` | Enable push notifications | `"true"` |
| `ENABLE_BACKGROUND_PLAY` | Enable background audio | `"true"` |

### Future: Automated Build System

In later phases, consider implementing:
- **White-label build automation**: Admin enters config in web dashboard, system generates APK/IPA
- **Branding preview**: Live preview of how app looks with station branding
- **One-click deployment**: Automatic upload to app stores (with proper credentials)