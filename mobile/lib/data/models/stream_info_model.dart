import '../../domain/entities/stream_info.dart';

class StreamInfoModel extends StreamInfo {
  const StreamInfoModel({
    required super.url,
    required super.quality,
    required super.bitrate,
    required super.format,
    super.isActive,
  });

  factory StreamInfoModel.fromJson(Map<String, dynamic> json) {
    return StreamInfoModel(
      url: json['url'] as String,
      quality: StreamQuality.values.firstWhere(
        (quality) => quality.name == json['quality'],
        orElse: () => StreamQuality.medium,
      ),
      bitrate: json['bitrate'] as int,
      format: json['format'] as String,
      isActive: json['isActive'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'url': url,
      'quality': quality.name,
      'bitrate': bitrate,
      'format': format,
      'isActive': isActive,
    };
  }

  factory StreamInfoModel.fromEntity(StreamInfo streamInfo) {
    return StreamInfoModel(
      url: streamInfo.url,
      quality: streamInfo.quality,
      bitrate: streamInfo.bitrate,
      format: streamInfo.format,
      isActive: streamInfo.isActive,
    );
  }
}