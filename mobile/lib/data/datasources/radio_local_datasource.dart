import 'package:shared_preferences/shared_preferences.dart';

abstract class RadioLocalDataSource {
  Future<void> setFavoriteProgram(String programId, bool isFavorite);
  Future<List<String>> getFavoritePrograms();
  Future<void> cacheProgramSchedule(String date, String scheduleJson);
  Future<String?> getCachedProgramSchedule(String date);
}

class RadioLocalDataSourceImpl implements RadioLocalDataSource {
  static const String _favoriteProgramsKey = 'favorite_programs';
  static const String _scheduleKeyPrefix = 'schedule_';

  @override
  Future<void> setFavoriteProgram(String programId, bool isFavorite) async {
    final prefs = await SharedPreferences.getInstance();
    final favoritePrograms = await getFavoritePrograms();

    if (isFavorite && !favoritePrograms.contains(programId)) {
      favoritePrograms.add(programId);
    } else if (!isFavorite && favoritePrograms.contains(programId)) {
      favoritePrograms.remove(programId);
    }

    await prefs.setStringList(_favoriteProgramsKey, favoritePrograms);
  }

  @override
  Future<List<String>> getFavoritePrograms() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getStringList(_favoriteProgramsKey) ?? [];
  }

  @override
  Future<void> cacheProgramSchedule(String date, String scheduleJson) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('$_scheduleKeyPrefix$date', scheduleJson);
  }

  @override
  Future<String?> getCachedProgramSchedule(String date) async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('$_scheduleKeyPrefix$date');
  }
}