# Radio Station App

A Flutter radio streaming application with live audio streaming, program schedules, and user preferences.

## Features

- **Live Radio Streaming**: Stream radio with play/pause controls and quality selection
- **Program Schedule**: View daily program listings with current program highlighting
- **Favorites**: Mark programs as favorites for easy access
- **Notifications**: Set reminders for upcoming programs
- **Settings**: Configure notification preferences and app settings

## Architecture

This app follows **MVVM (Model-View-ViewModel)** architecture with **Repository Pattern** for clean separation of concerns:

- **Domain Layer**: Business entities, repository interfaces, and use cases
- **Data Layer**: Data models, data sources (local/remote), and repository implementations
- **Presentation Layer**: UI screens, view models, and reusable widgets
- **Core Layer**: Services for dependency injection, audio streaming, and notifications

## Getting Started

### Prerequisites
- Flutter SDK 3.8.1 or higher
- Dart SDK
- Android Studio / VS Code with Flutter extensions

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   flutter pub get
   ```

3. Run the app:
   ```bash
   flutter run
   ```

### Available Commands

```bash
# Install dependencies
flutter pub get

# Run static analysis
flutter analyze

# Run tests
flutter test

# Build for Android
flutter build apk --debug

# Clean build artifacts
flutter clean
```

## Stream URLs

The app is configured to work with these radio streams:
- High Quality: `https://streaming.hostpannel.lat:8012/stream`
- Medium Quality: `https://streaming.hostpannel.lat:2020/public/magicafm`

## Current Implementation

The app currently uses **mock data** for development and testing. The mock implementation provides:
- Sample program schedules with realistic timing
- Mock stream URLs for testing audio functionality
- Local storage for user preferences and favorites

## Backend Integration

To integrate with a real backend:
1. Replace mock implementations in `lib/data/datasources/`
2. Update repository implementations to handle real API responses
3. Configure proper error handling and loading states

## Key Dependencies

- **just_audio**: Audio streaming and playback
- **provider**: State management
- **shared_preferences**: Local data persistence
- **flutter_local_notifications**: Push notifications
- **cached_network_image**: Efficient image loading

## Project Structure

```
lib/
├── core/               # Core services and utilities
├── data/               # Data layer (models, repositories, datasources)
├── domain/             # Domain layer (entities, repository interfaces, use cases)
└── presentation/       # Presentation layer (views, viewmodels, widgets)
```
