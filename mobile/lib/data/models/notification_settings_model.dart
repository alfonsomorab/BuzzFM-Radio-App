import '../../domain/entities/notification_settings.dart';

class NotificationSettingsModel extends NotificationSettings {
  const NotificationSettingsModel({
    super.notificationsEnabled,
    super.preferredType,
    super.programReminders,
    super.reminderMinutesBefore,
    super.favoritePrograms,
  });

  factory NotificationSettingsModel.fromJson(Map<String, dynamic> json) {
    return NotificationSettingsModel(
      notificationsEnabled: json['notificationsEnabled'] as bool? ?? true,
      preferredType: NotificationType.values.firstWhere(
        (type) => type.name == json['preferredType'],
        orElse: () => NotificationType.push,
      ),
      programReminders: json['programReminders'] as bool? ?? true,
      reminderMinutesBefore: json['reminderMinutesBefore'] as int? ?? 5,
      favoritePrograms: (json['favoritePrograms'] as List<dynamic>?)
              ?.map((program) => program as String)
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'notificationsEnabled': notificationsEnabled,
      'preferredType': preferredType.name,
      'programReminders': programReminders,
      'reminderMinutesBefore': reminderMinutesBefore,
      'favoritePrograms': favoritePrograms,
    };
  }

  factory NotificationSettingsModel.fromEntity(NotificationSettings settings) {
    return NotificationSettingsModel(
      notificationsEnabled: settings.notificationsEnabled,
      preferredType: settings.preferredType,
      programReminders: settings.programReminders,
      reminderMinutesBefore: settings.reminderMinutesBefore,
      favoritePrograms: settings.favoritePrograms,
    );
  }

  @override
  NotificationSettingsModel copyWith({
    bool? notificationsEnabled,
    NotificationType? preferredType,
    bool? programReminders,
    int? reminderMinutesBefore,
    List<String>? favoritePrograms,
  }) {
    return NotificationSettingsModel(
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
      preferredType: preferredType ?? this.preferredType,
      programReminders: programReminders ?? this.programReminders,
      reminderMinutesBefore: reminderMinutesBefore ?? this.reminderMinutesBefore,
      favoritePrograms: favoritePrograms ?? this.favoritePrograms,
    );
  }
}