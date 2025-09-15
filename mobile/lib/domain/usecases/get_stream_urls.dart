import '../entities/stream_info.dart';
import '../repositories/radio_repository.dart';

class GetStreamUrls {
  final RadioRepository repository;

  GetStreamUrls(this.repository);

  Future<List<StreamInfo>> call() async {
    return await repository.getStreamUrls();
  }
}