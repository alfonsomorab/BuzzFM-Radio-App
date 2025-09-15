import 'dart:async';
import 'package:audio_service/audio_service.dart';
import 'package:just_audio/just_audio.dart';
import '../../domain/entities/radio_program.dart';
import 'audio_service.dart' as app_audio;

class MediaNotificationService extends BaseAudioHandler with SeekHandler {
  static final MediaNotificationService _instance = MediaNotificationService._internal();
  factory MediaNotificationService() => _instance;
  MediaNotificationService._internal();

  final app_audio.AudioPlayerService _audioPlayerService = app_audio.AudioPlayerService();
  late StreamSubscription _playbackStateSubscription;
  late StreamSubscription _positionSubscription;

  RadioProgram? _currentProgram;
  String? _currentStreamUrl;
  bool _isInitialized = false;

  Future<void> initialize() async {
    if (_isInitialized) return;

    try {
      print('MediaNotificationService: Starting initialization...');

      // Initialize audio service
      await AudioService.init(
        builder: () => this,
        config: const AudioServiceConfig(
          androidNotificationChannelId: 'com.example.radioapp.audio',
          androidNotificationChannelName: 'Radio Stream',
          androidNotificationOngoing: false,
          androidShowNotificationBadge: true,
          androidStopForegroundOnPause: false,
          fastForwardInterval: Duration(seconds: 10),
          rewindInterval: Duration(seconds: 10),
        ),
      );

      print('MediaNotificationService: AudioService.init completed successfully');
    } catch (e) {
      print('MediaNotificationService: Error during initialization: $e');
      rethrow;
    }

    // Listen to playback state changes
    _playbackStateSubscription = _audioPlayerService.playbackStateStream.listen((state) {
      _updatePlaybackState(state);
    });

    // Listen to position changes for live streams
    _positionSubscription = _audioPlayerService.positionStream.listen((position) {
      _updatePosition(position);
    });

    _isInitialized = true;
  }

  void _updatePlaybackState(app_audio.PlaybackState state) {
    final playing = state == app_audio.PlaybackState.playing;
    final buffering = state == app_audio.PlaybackState.loading;

    playbackState.add(playbackState.value.copyWith(
      controls: [
        if (playing) MediaControl.pause else MediaControl.play,
        MediaControl.stop,
      ],
      systemActions: const {
        MediaAction.seek,
        MediaAction.seekForward,
        MediaAction.seekBackward,
      },
      androidCompactActionIndices: const [0],
      processingState: buffering
          ? AudioProcessingState.buffering
          : playing
              ? AudioProcessingState.ready
              : AudioProcessingState.idle,
      playing: playing,
      updatePosition: Duration.zero,
      bufferedPosition: Duration.zero,
      speed: 1.0,
    ));
  }

  void _updatePosition(Duration position) {
    playbackState.add(playbackState.value.copyWith(
      updatePosition: position,
    ));
  }

  Future<void> updateCurrentProgram(RadioProgram? program) async {
    _currentProgram = program;
    await _updateMediaItem();
  }

  Future<void> updateStreamUrl(String? streamUrl) async {
    _currentStreamUrl = streamUrl;
    await _updateMediaItem();
  }

  Future<void> _updateMediaItem() async {
    if (_currentProgram == null) {
      print('MediaNotificationService: Setting default media item');
      mediaItem.add(MediaItem(
        id: 'radio_stream',
        title: 'Radio Stream',
        artist: 'Live Radio',
        duration: null, // Live stream
        artUri: null,
        extras: {'isLive': true},
      ));
      return;
    }

    final program = _currentProgram!;
    print('MediaNotificationService: Setting media item for program: ${program.title}');
    mediaItem.add(MediaItem(
      id: 'radio_stream',
      title: program.title,
      artist: program.host ?? 'Live Radio',
      album: 'Radio Program',
      duration: null, // Live stream
      artUri: Uri.tryParse(program.imageUrl),
      extras: {
        'isLive': true,
        'description': program.description,
        'startTime': program.startTime.toIso8601String(),
        'endTime': program.endTime.toIso8601String(),
      },
    ));
    print('MediaNotificationService: Media item updated successfully');
  }

  @override
  Future<void> play() async {
    try {
      print('MediaNotificationService: play() called');

      // If no stream URL is set, use the current one from audio service
      if (_currentStreamUrl == null) {
        _currentStreamUrl = _audioPlayerService.currentStreamUrl;
        print('MediaNotificationService: Using stream URL from audio service: $_currentStreamUrl');
      }

      if (_currentStreamUrl != null) {
        print('MediaNotificationService: Setting stream URL: $_currentStreamUrl');
        await _audioPlayerService.setStreamUrl(_currentStreamUrl!);
      }

      print('MediaNotificationService: Starting playback...');
      await _audioPlayerService.play();
      print('MediaNotificationService: Playback started successfully');
    } catch (e) {
      print('MediaNotificationService: Error during play: $e');
      playbackState.add(playbackState.value.copyWith(
        processingState: AudioProcessingState.error,
      ));
    }
  }

  @override
  Future<void> pause() async {
    try {
      await _audioPlayerService.pause();
    } catch (e) {
      playbackState.add(playbackState.value.copyWith(
        processingState: AudioProcessingState.error,
      ));
    }
  }

  @override
  Future<void> stop() async {
    try {
      await _audioPlayerService.stop();
      _currentStreamUrl = null;

      // Clear the media item when stopped
      mediaItem.add(null);

      playbackState.add(playbackState.value.copyWith(
        processingState: AudioProcessingState.idle,
        playing: false,
      ));
    } catch (e) {
      playbackState.add(playbackState.value.copyWith(
        processingState: AudioProcessingState.error,
      ));
    }
  }

  @override
  Future<void> seek(Duration position) async {
    // For live streams, seeking might not be supported
    // This can be used for future features like rewinding live content
  }

  @override
  Future<void> click([MediaButton button = MediaButton.media]) async {
    switch (button) {
      case MediaButton.media:
        if (playbackState.value.playing) {
          await pause();
        } else {
          await play();
        }
        break;
      case MediaButton.next:
        // Could implement changing stream quality
        break;
      case MediaButton.previous:
        // Could implement changing stream quality
        break;
    }
  }

  Future<void> setStreamUrl(String url) async {
    _currentStreamUrl = url;
    await _audioPlayerService.setStreamUrl(url);
  }

  // Custom action to change stream quality
  Future<void> changeStreamQuality(String newStreamUrl) async {
    final wasPlaying = playbackState.value.playing;

    await _audioPlayerService.setStreamUrl(newStreamUrl);
    _currentStreamUrl = newStreamUrl;

    if (wasPlaying) {
      await _audioPlayerService.play();
    }
  }

  void dispose() {
    _playbackStateSubscription.cancel();
    _positionSubscription.cancel();
    _audioPlayerService.dispose();
  }
}

// Extension to make the service globally accessible
extension MediaNotificationServiceExtension on AudioService {
  static MediaNotificationService get instance => MediaNotificationService();
}