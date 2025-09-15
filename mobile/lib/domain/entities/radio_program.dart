import 'package:equatable/equatable.dart';

class RadioProgram extends Equatable {
  final String id;
  final String title;
  final String description;
  final String imageUrl;
  final DateTime startTime;
  final DateTime endTime;
  final bool isLive;
  final String? host;
  final List<String> tags;

  const RadioProgram({
    required this.id,
    required this.title,
    required this.description,
    required this.imageUrl,
    required this.startTime,
    required this.endTime,
    this.isLive = false,
    this.host,
    this.tags = const [],
  });

  Duration get duration => endTime.difference(startTime);

  bool get isCurrentlyPlaying {
    final now = DateTime.now();
    return now.isAfter(startTime) && now.isBefore(endTime);
  }

  @override
  List<Object?> get props => [
        id,
        title,
        description,
        imageUrl,
        startTime,
        endTime,
        isLive,
        host,
        tags,
      ];
}