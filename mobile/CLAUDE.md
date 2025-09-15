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

### Mock Data Implementation

Currently uses mock data in `RadioRemoteDataSourceImpl` with realistic program schedules and stream URLs:
- `https://streaming.hostpannel.lat:8012/stream`
- `https://streaming.hostpannel.lat:2020/public/magicafm`

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