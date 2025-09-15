import '../../data/datasources/radio_local_datasource.dart';
import '../../data/datasources/radio_remote_datasource.dart';
import '../../data/datasources/settings_local_datasource.dart';
import '../../data/repositories/radio_repository_impl.dart';
import '../../data/repositories/settings_repository_impl.dart';
import '../../domain/repositories/radio_repository.dart';
import '../../domain/repositories/settings_repository.dart';
import '../../domain/usecases/get_current_program.dart';
import '../../domain/usecases/get_stream_urls.dart';
import '../../domain/usecases/get_today_schedule.dart';
import '../../presentation/viewmodels/radio_viewmodel.dart';
import '../../presentation/viewmodels/schedule_viewmodel.dart';
import '../../presentation/viewmodels/settings_viewmodel.dart';
import 'audio_service.dart';
import 'media_notification_service.dart';

class DependencyInjection {
  static final DependencyInjection _instance = DependencyInjection._internal();
  factory DependencyInjection() => _instance;
  DependencyInjection._internal();

  late final RadioRemoteDataSource _radioRemoteDataSource;
  late final RadioLocalDataSource _radioLocalDataSource;
  late final SettingsLocalDataSource _settingsLocalDataSource;
  late final RadioRepository _radioRepository;
  late final SettingsRepository _settingsRepository;
  late final AudioPlayerService _audioPlayerService;
  late final MediaNotificationService _mediaNotificationService;

  void init() {
    _radioRemoteDataSource = RadioRemoteDataSourceImpl();
    _radioLocalDataSource = RadioLocalDataSourceImpl();
    _settingsLocalDataSource = SettingsLocalDataSourceImpl();

    _radioRepository = RadioRepositoryImpl(
      remoteDataSource: _radioRemoteDataSource,
      localDataSource: _radioLocalDataSource,
    );

    _settingsRepository = SettingsRepositoryImpl(
      localDataSource: _settingsLocalDataSource,
    );

    _audioPlayerService = AudioPlayerService();
    _mediaNotificationService = MediaNotificationService();
  }

  Future<void> initializeServices() async {
    await _mediaNotificationService.initialize();
  }

  RadioViewModel get radioViewModel => RadioViewModel(
        getCurrentProgram: GetCurrentProgram(_radioRepository),
        getStreamUrls: GetStreamUrls(_radioRepository),
        audioPlayerService: _audioPlayerService,
        mediaNotificationService: _mediaNotificationService,
      );

  ScheduleViewModel get scheduleViewModel => ScheduleViewModel(
        getTodaySchedule: GetTodaySchedule(_radioRepository),
        radioRepository: _radioRepository,
      );

  SettingsViewModel get settingsViewModel => SettingsViewModel(
        settingsRepository: _settingsRepository,
        getStreamUrls: GetStreamUrls(_radioRepository),
        audioPlayerService: _audioPlayerService,
      );

  AudioPlayerService get audioPlayerService => _audioPlayerService;
  MediaNotificationService get mediaNotificationService => _mediaNotificationService;
}