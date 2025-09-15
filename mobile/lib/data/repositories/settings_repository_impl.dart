import '../../domain/entities/notification_settings.dart';
import '../../domain/repositories/settings_repository.dart';
import '../datasources/settings_local_datasource.dart';
import '../models/notification_settings_model.dart';

class SettingsRepositoryImpl implements SettingsRepository {
  final SettingsLocalDataSource localDataSource;

  SettingsRepositoryImpl({required this.localDataSource});

  @override
  Future<NotificationSettings> getNotificationSettings() async {
    try {
      return await localDataSource.getNotificationSettings();
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> updateNotificationSettings(NotificationSettings settings) async {
    try {
      final settingsModel = NotificationSettingsModel.fromEntity(settings);
      await localDataSource.saveNotificationSettings(settingsModel);
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> clearAllSettings() async {
    try {
      await localDataSource.clearAllSettings();
    } catch (e) {
      rethrow;
    }
  }
}