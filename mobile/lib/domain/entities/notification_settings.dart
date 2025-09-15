import 'package:equatable/equatable.dart';

enum NotificationType { push, email, both }

class NotificationSettings extends Equatable {
  final bool notificationsEnabled;
  final NotificationType preferredType;
  final bool programReminders;
  final int reminderMinutesBefore;
  final List<String> favoritePrograms;

  const NotificationSettings({
    this.notificationsEnabled = true,
    this.preferredType = NotificationType.push,
    this.programReminders = true,
    this.reminderMinutesBefore = 5,
    this.favoritePrograms = const [],
  });

  NotificationSettings copyWith({
    bool? notificationsEnabled,
    NotificationType? preferredType,
    bool? programReminders,
    int? reminderMinutesBefore,
    List<String>? favoritePrograms,
  }) {
    return NotificationSettings(
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
      preferredType: preferredType ?? this.preferredType,
      programReminders: programReminders ?? this.programReminders,
      reminderMinutesBefore: reminderMinutesBefore ?? this.reminderMinutesBefore,
      favoritePrograms: favoritePrograms ?? this.favoritePrograms,
    );
  }

  @override
  List<Object> get props => [
        notificationsEnabled,
        preferredType,
        programReminders,
        reminderMinutesBefore,
        favoritePrograms,
      ];
}