import '../../domain/entities/radio_program.dart';

class RadioProgramModel extends RadioProgram {
  const RadioProgramModel({
    required super.id,
    required super.title,
    required super.description,
    required super.imageUrl,
    required super.startTime,
    required super.endTime,
    super.isLive,
    super.host,
    super.tags,
  });

  factory RadioProgramModel.fromJson(Map<String, dynamic> json) {
    return RadioProgramModel(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      imageUrl: json['imageUrl'] as String,
      startTime: DateTime.parse(json['startTime'] as String),
      endTime: DateTime.parse(json['endTime'] as String),
      isLive: json['isLive'] as bool? ?? false,
      host: json['host'] as String?,
      tags: (json['tags'] as List<dynamic>?)
              ?.map((tag) => tag as String)
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'imageUrl': imageUrl,
      'startTime': startTime.toIso8601String(),
      'endTime': endTime.toIso8601String(),
      'isLive': isLive,
      'host': host,
      'tags': tags,
    };
  }

  factory RadioProgramModel.fromEntity(RadioProgram program) {
    return RadioProgramModel(
      id: program.id,
      title: program.title,
      description: program.description,
      imageUrl: program.imageUrl,
      startTime: program.startTime,
      endTime: program.endTime,
      isLive: program.isLive,
      host: program.host,
      tags: program.tags,
    );
  }
}