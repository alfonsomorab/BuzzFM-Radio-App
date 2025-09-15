import '../entities/radio_program.dart';
import '../repositories/radio_repository.dart';

class GetTodaySchedule {
  final RadioRepository repository;

  GetTodaySchedule(this.repository);

  Future<List<RadioProgram>> call() async {
    return await repository.getTodaySchedule();
  }
}