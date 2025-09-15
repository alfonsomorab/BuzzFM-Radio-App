import 'package:flutter_dotenv/flutter_dotenv.dart';

class EnvironmentConfig {
  static Future<void> initialize() async {
    await dotenv.load(fileName: ".env");
  }

  // App Configuration
  static String get appName => dotenv.env['APP_NAME'] ?? 'Radio App';
  static String get appDescription => dotenv.env['APP_DESCRIPTION'] ?? 'A Flutter radio streaming app';

  // Package Names
  static String get androidPackageName => dotenv.env['ANDROID_PACKAGE_NAME'] ?? 'com.example.radio_app';
  static String get iosBundleId => dotenv.env['IOS_BUNDLE_ID'] ?? 'com.example.radioapp';

  // API Configuration
  static String get apiBaseUrl => dotenv.env['API_BASE_URL'] ?? 'https://api.example.com';
  static String get apiKey => dotenv.env['API_KEY'] ?? '';

  // Streaming Configuration
  static String get streamUrlHigh => dotenv.env['STREAM_URL_HIGH'] ?? '';
  static int get streamBitrateHigh => int.tryParse(dotenv.env['STREAM_BITRATE_HIGH'] ?? '320') ?? 320;
  static String get streamQualityHigh => dotenv.env['STREAM_QUALITY_HIGH'] ?? 'high';

  static String get streamUrlMedium => dotenv.env['STREAM_URL_MEDIUM'] ?? '';
  static int get streamBitrateMedium => int.tryParse(dotenv.env['STREAM_BITRATE_MEDIUM'] ?? '128') ?? 128;
  static String get streamQualityMedium => dotenv.env['STREAM_QUALITY_MEDIUM'] ?? 'medium';

  static String get streamUrlLow => dotenv.env['STREAM_URL_LOW'] ?? '';
  static int get streamBitrateLow => int.tryParse(dotenv.env['STREAM_BITRATE_LOW'] ?? '64') ?? 64;
  static String get streamQualityLow => dotenv.env['STREAM_QUALITY_LOW'] ?? 'low';

  // App Settings
  static String get defaultStreamQuality => dotenv.env['DEFAULT_STREAM_QUALITY'] ?? 'high';
  static bool get enableNotifications => dotenv.env['ENABLE_NOTIFICATIONS']?.toLowerCase() == 'true';
  static bool get enableBackgroundPlay => dotenv.env['ENABLE_BACKGROUND_PLAY']?.toLowerCase() == 'true';

  // Development Settings
  static bool get isDebugMode => dotenv.env['DEBUG_MODE']?.toLowerCase() == 'true';
  static String get logLevel => dotenv.env['LOG_LEVEL'] ?? 'info';

  // Helper method to get all available stream configurations
  static List<Map<String, dynamic>> getStreamConfigurations() {
    final streams = <Map<String, dynamic>>[];

    if (streamUrlHigh.isNotEmpty) {
      streams.add({
        'url': streamUrlHigh,
        'bitrate': streamBitrateHigh,
        'quality': streamQualityHigh,
      });
    }

    if (streamUrlMedium.isNotEmpty) {
      streams.add({
        'url': streamUrlMedium,
        'bitrate': streamBitrateMedium,
        'quality': streamQualityMedium,
      });
    }

    if (streamUrlLow.isNotEmpty) {
      streams.add({
        'url': streamUrlLow,
        'bitrate': streamBitrateLow,
        'quality': streamQualityLow,
      });
    }

    return streams;
  }
}