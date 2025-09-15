import 'package:equatable/equatable.dart';

enum StreamQuality { low, medium, high }

class StreamInfo extends Equatable {
  final String url;
  final StreamQuality quality;
  final int bitrate;
  final String format;
  final bool isActive;

  const StreamInfo({
    required this.url,
    required this.quality,
    required this.bitrate,
    required this.format,
    this.isActive = true,
  });

  @override
  List<Object> get props => [url, quality, bitrate, format, isActive];
}