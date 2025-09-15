import '../../domain/entities/radio_program.dart';
import '../../domain/entities/stream_info.dart';
import '../../domain/repositories/radio_repository.dart';
import '../datasources/radio_local_datasource.dart';
import '../datasources/radio_remote_datasource.dart';

class RadioRepositoryImpl implements RadioRepository {
  final RadioRemoteDataSource remoteDataSource;
  final RadioLocalDataSource localDataSource;

  RadioRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
  });

  @override
  Future<List<RadioProgram>> getTodaySchedule() async {
    try {
      final programs = await remoteDataSource.getTodaySchedule();
      return programs.cast<RadioProgram>();
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<List<RadioProgram>> getScheduleByDate(DateTime date) async {
    try {
      final programs = await remoteDataSource.getScheduleByDate(date);
      return programs.cast<RadioProgram>();
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<RadioProgram?> getCurrentProgram() async {
    try {
      final program = await remoteDataSource.getCurrentProgram();
      return program;
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<List<StreamInfo>> getStreamUrls() async {
    try {
      final streams = await remoteDataSource.getStreamUrls();
      return streams.cast<StreamInfo>();
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> setFavoriteProgram(String programId, bool isFavorite) async {
    try {
      await localDataSource.setFavoriteProgram(programId, isFavorite);
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<List<String>> getFavoritePrograms() async {
    try {
      return await localDataSource.getFavoritePrograms();
    } catch (e) {
      rethrow;
    }
  }
}