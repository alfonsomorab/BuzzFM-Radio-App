import '../entities/radio_program.dart';
import '../entities/stream_info.dart';

abstract class RadioRepository {
  Future<List<RadioProgram>> getTodaySchedule();
  Future<List<RadioProgram>> getScheduleByDate(DateTime date);
  Future<RadioProgram?> getCurrentProgram();
  Future<List<StreamInfo>> getStreamUrls();
  Future<void> setFavoriteProgram(String programId, bool isFavorite);
  Future<List<String>> getFavoritePrograms();
}