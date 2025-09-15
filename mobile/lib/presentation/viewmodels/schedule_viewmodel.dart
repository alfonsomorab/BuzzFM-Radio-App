import 'package:flutter/foundation.dart';
import '../../domain/entities/radio_program.dart';
import '../../domain/repositories/radio_repository.dart';
import '../../domain/usecases/get_today_schedule.dart';

class ScheduleViewModel extends ChangeNotifier {
  final GetTodaySchedule getTodaySchedule;
  final RadioRepository radioRepository;

  ScheduleViewModel({
    required this.getTodaySchedule,
    required this.radioRepository,
  }) {
    loadTodaySchedule();
    loadFavoritePrograms();
  }

  List<RadioProgram> _programs = [];
  List<String> _favoritePrograms = [];
  bool _isLoading = false;
  String? _error;

  List<RadioProgram> get programs => _programs;
  List<String> get favoritePrograms => _favoritePrograms;
  bool get isLoading => _isLoading;
  String? get error => _error;

  bool isProgramFavorite(String programId) {
    return _favoritePrograms.contains(programId);
  }

  RadioProgram? get currentProgram {
    final now = DateTime.now();
    for (final program in _programs) {
      if (now.isAfter(program.startTime) && now.isBefore(program.endTime)) {
        return program;
      }
    }
    return null;
  }

  Future<void> loadTodaySchedule() async {
    _setLoading(true);
    try {
      _programs = await getTodaySchedule();
      _error = null;
    } catch (e) {
      _error = e.toString();
    } finally {
      _setLoading(false);
    }
  }

  Future<void> loadFavoritePrograms() async {
    try {
      _favoritePrograms = await radioRepository.getFavoritePrograms();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> toggleFavorite(String programId) async {
    try {
      final isFavorite = _favoritePrograms.contains(programId);
      await radioRepository.setFavoriteProgram(programId, !isFavorite);
      await loadFavoritePrograms();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> refresh() async {
    await Future.wait([
      loadTodaySchedule(),
      loadFavoritePrograms(),
    ]);
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }
}