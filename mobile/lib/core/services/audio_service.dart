import 'package:just_audio/just_audio.dart';

enum PlaybackState { stopped, playing, paused, loading, error }

class AudioPlayerService {
  static final AudioPlayerService _instance = AudioPlayerService._internal();
  factory AudioPlayerService() => _instance;
  AudioPlayerService._internal();

  final AudioPlayer _audioPlayer = AudioPlayer();
  String? _currentStreamUrl;

  AudioPlayer get audioPlayer => _audioPlayer;
  String? get currentStreamUrl => _currentStreamUrl;

  Stream<PlaybackState> get playbackStateStream =>
      _audioPlayer.playerStateStream.map((playerState) {
        if (playerState.processingState == ProcessingState.loading ||
            playerState.processingState == ProcessingState.buffering) {
          return PlaybackState.loading;
        } else if (playerState.playing) {
          return PlaybackState.playing;
        } else if (playerState.processingState == ProcessingState.completed) {
          return PlaybackState.stopped;
        } else {
          return PlaybackState.paused;
        }
      });

  Stream<Duration> get positionStream => _audioPlayer.positionStream;
  Stream<Duration?> get durationStream => _audioPlayer.durationStream;

  Future<void> setStreamUrl(String url) async {
    try {
      _currentStreamUrl = url;
      await _audioPlayer.setUrl(url);
    } catch (e) {
      throw Exception('Failed to load stream: $e');
    }
  }

  Future<void> play() async {
    try {
      await _audioPlayer.play();
    } catch (e) {
      throw Exception('Failed to play stream: $e');
    }
  }

  Future<void> pause() async {
    try {
      await _audioPlayer.pause();
    } catch (e) {
      throw Exception('Failed to pause stream: $e');
    }
  }

  Future<void> stop() async {
    try {
      await _audioPlayer.stop();
      _currentStreamUrl = null;
    } catch (e) {
      throw Exception('Failed to stop stream: $e');
    }
  }

  Future<void> setVolume(double volume) async {
    await _audioPlayer.setVolume(volume.clamp(0.0, 1.0));
  }

  void dispose() {
    _audioPlayer.dispose();
  }
}