import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../domain/entities/notification_settings.dart';
import '../viewmodels/settings_viewmodel.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
        backgroundColor: Theme.of(context).primaryColor,
        foregroundColor: Colors.white,
      ),
      body: Consumer<SettingsViewModel>(
        builder: (context, viewModel, child) {
          if (viewModel.isLoading) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          if (viewModel.error != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.error_outline,
                    size: 64,
                    color: Colors.red,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Error: ${viewModel.error}',
                    style: const TextStyle(color: Colors.red),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => viewModel.loadSettings(),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          final settings = viewModel.settings;

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _buildSection(
                title: 'Notifications',
                children: [
                  _buildSwitchTile(
                    title: 'Enable Notifications',
                    subtitle: 'Receive notifications about programs',
                    value: settings.notificationsEnabled,
                    onChanged: viewModel.updateNotificationsEnabled,
                  ),
                  if (settings.notificationsEnabled) ...[
                    _buildListTile(
                      title: 'Notification Type',
                      subtitle: _getNotificationTypeText(settings.preferredType),
                      trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                      onTap: () => _showNotificationTypeDialog(context, viewModel),
                    ),
                    _buildSwitchTile(
                      title: 'Program Reminders',
                      subtitle: 'Get reminded when your favorite programs start',
                      value: settings.programReminders,
                      onChanged: viewModel.updateProgramReminders,
                    ),
                    if (settings.programReminders)
                      _buildListTile(
                        title: 'Reminder Time',
                        subtitle: '${settings.reminderMinutesBefore} minutes before',
                        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                        onTap: () => _showReminderTimeDialog(context, viewModel),
                      ),
                  ],
                ],
              ),
              const SizedBox(height: 24),
              _buildSection(
                title: 'Audio',
                children: [
                  _buildListTile(
                    title: 'Stream Quality',
                    subtitle: _getSelectedStreamQualityText(viewModel),
                    trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                    onTap: () => _showStreamQualityDialog(context, viewModel),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              _buildSection(
                title: 'About',
                children: [
                  _buildListTile(
                    title: 'About Radio Station',
                    subtitle: 'Learn more about our radio station',
                    trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                    onTap: () => _showAboutDialog(context),
                  ),
                  _buildListTile(
                    title: 'Terms and Conditions',
                    subtitle: 'Read our terms and conditions',
                    trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                    onTap: () => _showTermsDialog(context),
                  ),
                  _buildListTile(
                    title: 'Privacy Policy',
                    subtitle: 'Read our privacy policy',
                    trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                    onTap: () => _showPrivacyDialog(context),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              _buildSection(
                title: 'Data',
                children: [
                  _buildListTile(
                    title: 'Clear All Data',
                    subtitle: 'Reset all settings and preferences',
                    trailing: const Icon(Icons.delete_outline, color: Colors.red),
                    onTap: () => _showClearDataDialog(context, viewModel),
                    titleColor: Colors.red,
                  ),
                ],
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildSection({
    required String title,
    required List<Widget> children,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.grey,
          ),
        ),
        const SizedBox(height: 8),
        Card(
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(children: children),
        ),
      ],
    );
  }

  Widget _buildSwitchTile({
    required String title,
    required String subtitle,
    required bool value,
    required Function(bool) onChanged,
  }) {
    return SwitchListTile(
      title: Text(title),
      subtitle: Text(subtitle),
      value: value,
      onChanged: onChanged,
    );
  }

  Widget _buildListTile({
    required String title,
    required String subtitle,
    Widget? trailing,
    VoidCallback? onTap,
    Color? titleColor,
  }) {
    return ListTile(
      title: Text(
        title,
        style: TextStyle(color: titleColor),
      ),
      subtitle: Text(subtitle),
      trailing: trailing,
      onTap: onTap,
    );
  }

  String _getNotificationTypeText(NotificationType type) {
    switch (type) {
      case NotificationType.push:
        return 'Push notifications only';
      case NotificationType.email:
        return 'Email notifications only';
      case NotificationType.both:
        return 'Push and email notifications';
    }
  }

  String _getSelectedStreamQualityText(SettingsViewModel viewModel) {
    if (viewModel.streamUrls.isEmpty) {
      return 'No streams available';
    }

    final selectedUrl = viewModel.selectedStreamUrl;
    if (selectedUrl == null) {
      return 'No quality selected';
    }

    final selectedStream = viewModel.streamUrls.firstWhere(
      (stream) => stream.url == selectedUrl,
      orElse: () => viewModel.streamUrls.first,
    );

    return '${selectedStream.quality.name.toUpperCase()} (${selectedStream.bitrate}kbps)';
  }

  void _showNotificationTypeDialog(BuildContext context, SettingsViewModel viewModel) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Notification Type'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: NotificationType.values.map((type) {
              return RadioListTile<NotificationType>(
                title: Text(_getNotificationTypeText(type)),
                value: type,
                groupValue: viewModel.settings.preferredType,
                onChanged: (NotificationType? value) {
                  if (value != null) {
                    viewModel.updateNotificationType(value);
                    Navigator.of(context).pop();
                  }
                },
              );
            }).toList(),
          ),
        );
      },
    );
  }

  void _showReminderTimeDialog(BuildContext context, SettingsViewModel viewModel) {
    final times = [1, 2, 5, 10, 15, 30];
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Reminder Time'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: times.map((minutes) {
              return RadioListTile<int>(
                title: Text('$minutes minutes before'),
                value: minutes,
                groupValue: viewModel.settings.reminderMinutesBefore,
                onChanged: (int? value) {
                  if (value != null) {
                    viewModel.updateReminderTime(value);
                    Navigator.of(context).pop();
                  }
                },
              );
            }).toList(),
          ),
        );
      },
    );
  }

  void _showStreamQualityDialog(BuildContext context, SettingsViewModel viewModel) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Stream Quality'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: viewModel.streamUrls.map((stream) {
              return RadioListTile<String>(
                title: Text('${stream.quality.name.toUpperCase()} (${stream.bitrate}kbps)'),
                value: stream.url,
                groupValue: viewModel.selectedStreamUrl,
                onChanged: (String? value) {
                  if (value != null) {
                    viewModel.updateSelectedStreamUrl(value);
                    Navigator.of(context).pop();
                  }
                },
              );
            }).toList(),
          ),
        );
      },
    );
  }

  void _showAboutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('About Radio Station'),
          content: const Text(
            'Welcome to our radio station app! We provide high-quality streaming and diverse programming to keep you entertained throughout the day.\n\nOur mission is to bring you the best music, news, and entertainment content from around the world.',
          ),
          actions: [
            TextButton(
              child: const Text('Close'),
              onPressed: () => Navigator.of(context).pop(),
            ),
          ],
        );
      },
    );
  }

  void _showTermsDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Terms and Conditions'),
          content: const SingleChildScrollView(
            child: Text(
              'By using this app, you agree to our terms and conditions:\n\n'
              '1. The content provided is for entertainment purposes only.\n'
              '2. We reserve the right to modify programming schedules.\n'
              '3. Users must not attempt to record or redistribute our content.\n'
              '4. We are not responsible for any interruptions in service.\n'
              '5. These terms may be updated from time to time.\n\n'
              'For the complete terms, please visit our website.',
            ),
          ),
          actions: [
            TextButton(
              child: const Text('Close'),
              onPressed: () => Navigator.of(context).pop(),
            ),
          ],
        );
      },
    );
  }

  void _showPrivacyDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Privacy Policy'),
          content: const SingleChildScrollView(
            child: Text(
              'We respect your privacy and are committed to protecting your personal information:\n\n'
              '• We only collect data necessary for app functionality\n'
              '• Your listening preferences are stored locally on your device\n'
              '• We do not share personal information with third parties\n'
              '• You can delete your data at any time through the settings\n'
              '• We use industry-standard security measures\n\n'
              'For our complete privacy policy, please visit our website.',
            ),
          ),
          actions: [
            TextButton(
              child: const Text('Close'),
              onPressed: () => Navigator.of(context).pop(),
            ),
          ],
        );
      },
    );
  }

  void _showClearDataDialog(BuildContext context, SettingsViewModel viewModel) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Clear All Data'),
          content: const Text(
            'This will reset all your settings and preferences. This action cannot be undone.',
          ),
          actions: [
            TextButton(
              child: const Text('Cancel'),
              onPressed: () => Navigator.of(context).pop(),
            ),
            TextButton(
              child: const Text('Clear Data', style: TextStyle(color: Colors.red)),
              onPressed: () {
                viewModel.clearAllSettings();
                Navigator.of(context).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('All data cleared successfully'),
                    backgroundColor: Colors.green,
                  ),
                );
              },
            ),
          ],
        );
      },
    );
  }
}