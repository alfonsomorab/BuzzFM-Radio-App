import '../models/radio_program_model.dart';
import '../models/stream_info_model.dart';
import '../../domain/entities/stream_info.dart';
import '../../core/config/environment_config.dart';

abstract class RadioRemoteDataSource {
  Future<List<RadioProgramModel>> getTodaySchedule();
  Future<List<RadioProgramModel>> getScheduleByDate(DateTime date);
  Future<RadioProgramModel?> getCurrentProgram();
  Future<List<StreamInfoModel>> getStreamUrls();
}

class RadioRemoteDataSourceImpl implements RadioRemoteDataSource {
  @override
  Future<List<RadioProgramModel>> getTodaySchedule() async {
    await Future.delayed(const Duration(seconds: 1));

    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);

    return [
      RadioProgramModel(
        id: '1',
        title: 'Morning Show',
        description: 'Start your day with the best music and news',
        imageUrl: 'https://picsum.photos/300/300?random=1',
        startTime: today.add(const Duration(hours: 6)),
        endTime: today.add(const Duration(hours: 10)),
        isLive: true,
        host: 'John Smith',
        tags: ['morning', 'music', 'news'],
      ),
      RadioProgramModel(
        id: '2',
        title: 'Jazz Classics',
        description: 'The finest selection of classic jazz',
        imageUrl: 'https://picsum.photos/300/300?random=2',
        startTime: today.add(const Duration(hours: 10)),
        endTime: today.add(const Duration(hours: 12)),
        isLive: false,
        host: 'Maria Garcia',
        tags: ['jazz', 'classics'],
      ),
      RadioProgramModel(
        id: '3',
        title: 'Lunch Time Mix',
        description: 'Perfect music for your lunch break',
        imageUrl: 'https://picsum.photos/300/300?random=3',
        startTime: today.add(const Duration(hours: 12)),
        endTime: today.add(const Duration(hours: 14)),
        isLive: false,
        host: 'Alex Johnson',
        tags: ['pop', 'lunch', 'mix'],
      ),
      RadioProgramModel(
        id: '4',
        title: 'Afternoon Drive',
        description: 'High energy music for your commute',
        imageUrl: 'https://picsum.photos/300/300?random=4',
        startTime: today.add(const Duration(hours: 14)),
        endTime: today.add(const Duration(hours: 18)),
        isLive: false,
        host: 'Sarah Wilson',
        tags: ['drive', 'energy', 'pop'],
      ),
      RadioProgramModel(
        id: '5',
        title: 'Evening Chill',
        description: 'Relaxing music to unwind after work',
        imageUrl: 'https://picsum.photos/300/300?random=5',
        startTime: today.add(const Duration(hours: 18)),
        endTime: today.add(const Duration(hours: 22)),
        isLive: false,
        host: 'Michael Brown',
        tags: ['chill', 'relaxing', 'evening'],
      ),
      RadioProgramModel(
        id: '6',
        title: 'Night Owl',
        description: 'Late night music for insomniacs',
        imageUrl: 'https://picsum.photos/300/300?random=6',
        startTime: today.add(const Duration(hours: 22)),
        endTime: today.add(const Duration(hours: 24)),
        isLive: false,
        host: 'Emma Davis',
        tags: ['night', 'ambient', 'calm'],
      ),
    ];
  }

  @override
  Future<List<RadioProgramModel>> getScheduleByDate(DateTime date) async {
    await Future.delayed(const Duration(seconds: 1));
    return getTodaySchedule();
  }

  @override
  Future<RadioProgramModel?> getCurrentProgram() async {
    final schedule = await getTodaySchedule();
    final now = DateTime.now();

    for (final program in schedule) {
      if (now.isAfter(program.startTime) && now.isBefore(program.endTime)) {
        return program;
      }
    }
    return null;
  }

  @override
  Future<List<StreamInfoModel>> getStreamUrls() async {
    await Future.delayed(const Duration(milliseconds: 500));

    final streamConfigs = EnvironmentConfig.getStreamConfigurations();
    final streams = <StreamInfoModel>[];

    for (final config in streamConfigs) {
      StreamQuality quality;
      switch (config['quality']) {
        case 'high':
          quality = StreamQuality.high;
          break;
        case 'medium':
          quality = StreamQuality.medium;
          break;
        case 'low':
          quality = StreamQuality.low;
          break;
        default:
          quality = StreamQuality.medium;
      }

      streams.add(StreamInfoModel(
        url: config['url'],
        quality: quality,
        bitrate: config['bitrate'],
        format: 'mp3',
        isActive: true,
      ));
    }

    return streams;
  }
}