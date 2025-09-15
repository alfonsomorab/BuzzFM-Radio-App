import '../entities/notification_settings.dart';

abstract class SettingsRepository {
  Future<NotificationSettings> getNotificationSettings();
  Future<void> updateNotificationSettings(NotificationSettings settings);
  Future<void> clearAllSettings();
}