import '../entities/radio_program.dart';
import '../repositories/radio_repository.dart';

class GetCurrentProgram {
  final RadioRepository repository;

  GetCurrentProgram(this.repository);

  Future<RadioProgram?> call() async {
    return await repository.getCurrentProgram();
  }
}