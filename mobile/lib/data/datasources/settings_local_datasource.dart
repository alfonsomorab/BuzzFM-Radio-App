import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/notification_settings_model.dart';

abstract class SettingsLocalDataSource {
  Future<NotificationSettingsModel> getNotificationSettings();
  Future<void> saveNotificationSettings(NotificationSettingsModel settings);
  Future<void> clearAllSettings();
}

class SettingsLocalDataSourceImpl implements SettingsLocalDataSource {
  static const String _notificationSettingsKey = 'notification_settings';

  @override
  Future<NotificationSettingsModel> getNotificationSettings() async {
    final prefs = await SharedPreferences.getInstance();
    final settingsJson = prefs.getString(_notificationSettingsKey);

    if (settingsJson != null) {
      final settingsMap = jsonDecode(settingsJson) as Map<String, dynamic>;
      return NotificationSettingsModel.fromJson(settingsMap);
    }

    return const NotificationSettingsModel();
  }

  @override
  Future<void> saveNotificationSettings(NotificationSettingsModel settings) async {
    final prefs = await SharedPreferences.getInstance();
    final settingsJson = jsonEncode(settings.toJson());
    await prefs.setString(_notificationSettingsKey, settingsJson);
  }

  @override
  Future<void> clearAllSettings() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }
}