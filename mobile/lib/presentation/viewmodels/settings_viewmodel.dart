import 'package:flutter/foundation.dart';
import '../../domain/entities/notification_settings.dart';
import '../../domain/entities/stream_info.dart';
import '../../domain/repositories/settings_repository.dart';
import '../../domain/usecases/get_stream_urls.dart';
import '../../core/services/audio_service.dart';

class SettingsViewModel extends ChangeNotifier {
  final SettingsRepository settingsRepository;
  final GetStreamUrls getStreamUrls;
  final AudioPlayerService audioPlayerService;

  SettingsViewModel({
    required this.settingsRepository,
    required this.getStreamUrls,
    required this.audioPlayerService,
  }) {
    loadSettings();
    loadStreamUrls();
  }

  NotificationSettings _settings = const NotificationSettings();
  List<StreamInfo> _streamUrls = [];
  bool _isLoading = false;
  String? _error;

  NotificationSettings get settings => _settings;
  List<StreamInfo> get streamUrls => _streamUrls;
  bool get isLoading => _isLoading;
  String? get error => _error;

  String? get selectedStreamUrl => audioPlayerService.currentStreamUrl;

  Future<void> loadSettings() async {
    _setLoading(true);
    try {
      _settings = await settingsRepository.getNotificationSettings();
      _error = null;
    } catch (e) {
      _error = e.toString();
    } finally {
      _setLoading(false);
    }
  }

  Future<void> loadStreamUrls() async {
    try {
      _streamUrls = await getStreamUrls();
      _error = null;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> updateSelectedStreamUrl(String streamUrl) async {
    try {
      final wasPlaying = audioPlayerService.audioPlayer.playing;
      await audioPlayerService.setStreamUrl(streamUrl);
      if (wasPlaying) {
        await audioPlayerService.play();
      }
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> updateNotificationsEnabled(bool enabled) async {
    try {
      final updatedSettings = _settings.copyWith(notificationsEnabled: enabled);
      await settingsRepository.updateNotificationSettings(updatedSettings);
      _settings = updatedSettings;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> updateNotificationType(NotificationType type) async {
    try {
      final updatedSettings = _settings.copyWith(preferredType: type);
      await settingsRepository.updateNotificationSettings(updatedSettings);
      _settings = updatedSettings;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> updateProgramReminders(bool enabled) async {
    try {
      final updatedSettings = _settings.copyWith(programReminders: enabled);
      await settingsRepository.updateNotificationSettings(updatedSettings);
      _settings = updatedSettings;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> updateReminderTime(int minutes) async {
    try {
      final updatedSettings = _settings.copyWith(reminderMinutesBefore: minutes);
      await settingsRepository.updateNotificationSettings(updatedSettings);
      _settings = updatedSettings;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> clearAllSettings() async {
    try {
      await settingsRepository.clearAllSettings();
      _settings = const NotificationSettings();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }
}