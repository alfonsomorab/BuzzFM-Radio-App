import 'package:flutter/foundation.dart';
import '../../core/services/audio_service.dart';
import '../../domain/entities/radio_program.dart';
import '../../domain/entities/stream_info.dart';
import '../../domain/usecases/get_current_program.dart';
import '../../domain/usecases/get_stream_urls.dart';

class RadioViewModel extends ChangeNotifier {
  final GetCurrentProgram getCurrentProgram;
  final GetStreamUrls getStreamUrls;
  final AudioPlayerService audioPlayerService;

  RadioViewModel({
    required this.getCurrentProgram,
    required this.getStreamUrls,
    required this.audioPlayerService,
  }) {
    _init();
  }

  RadioProgram? _currentProgram;
  List<StreamInfo> _streamUrls = [];
  bool _isLoading = false;
  String? _error;
  PlaybackState _playbackState = PlaybackState.stopped;

  RadioProgram? get currentProgram => _currentProgram;
  List<StreamInfo> get streamUrls => _streamUrls;
  bool get isLoading => _isLoading;
  String? get error => _error;
  PlaybackState get playbackState => _playbackState;

  bool get isPlaying => _playbackState == PlaybackState.playing;
  bool get isPaused => _playbackState == PlaybackState.paused;
  bool get isBuffering => _playbackState == PlaybackState.loading;

  Duration get currentProgress {
    if (_currentProgram == null) return Duration.zero;
    final now = DateTime.now();
    if (now.isBefore(_currentProgram!.startTime)) return Duration.zero;
    if (now.isAfter(_currentProgram!.endTime)) return _currentProgram!.duration;
    return now.difference(_currentProgram!.startTime);
  }

  double get progressPercentage {
    if (_currentProgram == null) return 0.0;
    final progress = currentProgress.inSeconds;
    final total = _currentProgram!.duration.inSeconds;
    if (total == 0) return 0.0;
    return (progress / total).clamp(0.0, 1.0);
  }

  void _init() {
    audioPlayerService.playbackStateStream.listen((state) {
      _playbackState = state;
      notifyListeners();
    });
    loadCurrentProgram();
    loadStreamUrls();
  }

  Future<void> loadCurrentProgram() async {
    _setLoading(true);
    try {
      _currentProgram = await getCurrentProgram();
      _error = null;
    } catch (e) {
      _error = e.toString();
    } finally {
      _setLoading(false);
    }
  }

  Future<void> loadStreamUrls() async {
    try {
      _streamUrls = await getStreamUrls();
      _error = null;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> togglePlayback() async {
    try {
      if (_playbackState == PlaybackState.playing) {
        await audioPlayerService.pause();
      } else {
        if (audioPlayerService.currentStreamUrl == null && _streamUrls.isNotEmpty) {
          await audioPlayerService.setStreamUrl(_streamUrls.first.url);
        }
        await audioPlayerService.play();
      }
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> stop() async {
    try {
      await audioPlayerService.stop();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> changeStream(String streamUrl) async {
    try {
      final wasPlaying = _playbackState == PlaybackState.playing;
      await audioPlayerService.setStreamUrl(streamUrl);
      if (wasPlaying) {
        await audioPlayerService.play();
      }
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

}