# 📻 Radio App - Complete Radio Streaming Platform

A comprehensive radio streaming platform consisting of a **Flutter mobile app** and a **Laravel + React.js web platform**. This project provides everything needed to build, customize, and deploy your own radio streaming service.

![Flutter](https://img.shields.io/badge/Flutter-02569B?style=for-the-badge&logo=flutter&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Android](https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)
![iOS](https://img.shields.io/badge/iOS-000000?style=for-the-badge&logo=ios&logoColor=white)

## 🎯 Project Overview

This radio streaming platform enables radio stations, podcasters, and content creators to build their own branded streaming apps and web platforms. The project is designed to be easily customizable and deployable for different radio stations or streaming services.

### ✨ Key Features

- **📱 Native Mobile Apps** (iOS & Android) with Flutter
- **🌐 Web Management Dashboard** with React.js
- **🎵 Multi-Quality Audio Streaming** (High/Medium/Low)
- **📋 Program Schedule Management**
- **🔔 Push Notifications** for program alerts
- **⚙️ Environment-Based Configuration**
- **🎨 Easy Branding & Customization**
- **📊 Analytics Dashboard** (planned)
- **👥 User Management** (planned)

## 📁 Project Structure

```
radio-app/
├── mobile/                 # Flutter mobile application
│   ├── lib/
│   │   ├── core/          # Core services and configuration
│   │   ├── data/          # Data layer (repositories, datasources)
│   │   ├── domain/        # Business logic and entities
│   │   └── presentation/  # UI layer (screens, widgets, viewmodels)
│   ├── .env.example       # Environment configuration template
│   └── ENVIRONMENT_SETUP.md
│
├── cloud/                 # Laravel + React.js web platform
│   ├── backend/           # Laravel API backend (planned)
│   ├── frontend/          # React.js admin dashboard (planned)
│   └── infrastructure/    # Docker & deployment configs (planned)
│
└── README.md             # This file
```

## 📱 Mobile App (Flutter)

### Architecture
- **MVVM Pattern** with Repository pattern
- **Clean Architecture** with clear separation of concerns
- **Provider** for state management
- **Dependency Injection** for service management

### Core Features
- ✅ **Live Radio Streaming** with multiple quality options
- ✅ **Program Schedule** with real-time updates
- ✅ **Settings Management** with audio quality controls
- ✅ **Background Audio Playback**
- ✅ **Modern Material Design UI**
- ✅ **Environment-based Configuration**

### Technology Stack
- **Flutter 3.8+** - Cross-platform mobile framework
- **just_audio** - Audio streaming and playback
- **provider** - State management
- **shared_preferences** - Local data storage
- **cached_network_image** - Image loading and caching
- **flutter_dotenv** - Environment configuration

### Quick Start
```bash
cd mobile
cp .env.example .env
# Edit .env with your configuration
flutter pub get
flutter run
```

### Customization
The mobile app is fully configurable through environment variables:
- **App branding** (name, package names)
- **Streaming endpoints** (multiple quality levels)
- **Feature toggles** (notifications, background play)
- **API configuration** for backend integration

[📖 Read the complete Mobile Setup Guide](./mobile/ENVIRONMENT_SETUP.md)

## ☁️ Cloud Platform (Laravel + React.js) - *Coming Soon*

### Planned Backend (Laravel)
- **🎵 Stream Management** - Upload and manage audio content
- **📅 Schedule Management** - Create and manage program schedules
- **👥 User Management** - Admin and broadcaster accounts
- **📊 Analytics** - Listen statistics and engagement metrics
- **🔔 Notification System** - Push notifications to mobile apps
- **🎨 Content Management** - Program descriptions, images, hosts
- **🔐 Authentication & Authorization** - Role-based access control

### Planned Frontend (React.js)
- **📊 Dashboard** - Real-time analytics and monitoring
- **📅 Schedule Editor** - Drag-and-drop program scheduling
- **🎵 Content Library** - Audio file management
- **⚙️ Settings Panel** - Stream configuration and app settings
- **📱 Mobile App Management** - Push notification controls
- **👥 User Management** - Admin interface for users and roles

### Planned Technology Stack
- **Laravel 10+** - PHP backend framework
- **React.js 18+** - Frontend library
- **MySQL/PostgreSQL** - Database
- **Redis** - Caching and sessions
- **Docker** - Containerization
- **AWS S3** - Audio file storage
- **WebSockets** - Real-time updates

### Planned Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │◄──►│   Laravel API   │◄──►│  React.js Web   │
│   (Flutter)     │    │   (Backend)     │    │  (Dashboard)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         └─────────────►│   Database      │◄─────────────┘
                        │ (MySQL/Postgres)│
                        └─────────────────┘
```

## 🚀 Getting Started

### Prerequisites
- **Flutter SDK 3.8+** (for mobile app)
- **Dart 3.0+**
- **Android Studio** or **Xcode** (for mobile development)
- **PHP 8.1+** and **Composer** (for future Laravel backend)
- **Node.js 18+** and **npm/yarn** (for future React frontend)
- **Docker** (recommended for cloud deployment)

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/radio-app.git
   cd radio-app
   ```

2. **Set up the mobile app**
   ```bash
   cd mobile
   cp .env.example .env
   # Edit .env with your streaming URLs and app configuration
   flutter pub get
   flutter run
   ```

3. **Cloud platform setup** (coming soon)
   ```bash
   cd cloud
   # Setup instructions will be added when backend is implemented
   ```

## 🎨 Customization Guide

### For Radio Stations
1. **Update Environment Variables**
   - Change app name and branding
   - Configure your streaming endpoints
   - Set up API endpoints (when backend is ready)

2. **Customize UI/UX**
   - Update color schemes and themes
   - Replace logos and images
   - Modify program schedule layouts

3. **Configure Streaming**
   - Set up multiple quality streams
   - Configure default playback settings
   - Set up background playback options

### For Developers
- **Mobile**: Follow MVVM architecture patterns
- **Backend**: Clean API design with Laravel best practices
- **Frontend**: Component-based React.js architecture
- **Deployment**: Docker containers for easy scaling

## 📊 Roadmap

### Phase 1: Mobile App ✅
- [x] Core streaming functionality
- [x] Program schedule display
- [x] Settings and quality control
- [x] Environment configuration
- [x] Clean architecture implementation

### Phase 2: Backend API (In Progress)
- [ ] Laravel API setup
- [ ] Authentication system
- [ ] Stream management endpoints
- [ ] Schedule management
- [ ] Push notification service

### Phase 3: Web Dashboard
- [ ] React.js admin dashboard
- [ ] Real-time analytics
- [ ] Content management interface
- [ ] User management system

### Phase 4: Advanced Features
- [ ] Live chat integration
- [ ] Social media integration
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] White-label solutions

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines and feel free to submit pull requests.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests (when applicable)
5. Submit a pull request

### Areas We Need Help With
- 🎨 UI/UX improvements
- 🔧 Backend API development
- 📱 Mobile app features
- 🌐 Web dashboard development
- 📖 Documentation improvements
- 🧪 Testing and QA

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Flutter Team** - For the amazing cross-platform framework
- **Laravel Community** - For the robust backend framework
- **React.js Team** - For the powerful frontend library
- **Open Source Contributors** - For the packages and tools that make this possible

## 📞 Support

- **Documentation**: Check the README files in each directory
- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions
- **Email**: [your-email@example.com]

---

**Built with ❤️ for the radio streaming community**

*Transform your radio station into a modern streaming platform with native mobile apps and powerful web management tools.*