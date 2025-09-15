import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../viewmodels/schedule_viewmodel.dart';
import '../widgets/program_card_widget.dart';

class ScheduleScreen extends StatelessWidget {
  const ScheduleScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Schedule'),
        backgroundColor: Theme.of(context).primaryColor,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              context.read<ScheduleViewModel>().refresh();
            },
          ),
        ],
      ),
      body: Consumer<ScheduleViewModel>(
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
                    onPressed: () => viewModel.refresh(),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          if (viewModel.programs.isEmpty) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.schedule,
                    size: 64,
                    color: Colors.grey,
                  ),
                  SizedBox(height: 16),
                  Text(
                    'No programs scheduled for today',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey,
                    ),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: viewModel.refresh,
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: viewModel.programs.length,
              itemBuilder: (context, index) {
                final program = viewModel.programs[index];
                final isCurrentProgram = viewModel.currentProgram?.id == program.id;
                final isFavorite = viewModel.isProgramFavorite(program.id);

                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: ProgramCardWidget(
                    program: program,
                    isCurrentProgram: isCurrentProgram,
                    isFavorite: isFavorite,
                    onFavoriteToggle: () => viewModel.toggleFavorite(program.id),
                    onReminderSet: () => _showReminderDialog(context, program.title),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }

  void _showReminderDialog(BuildContext context, String programTitle) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Set Reminder'),
          content: Text('Set a reminder for "$programTitle"?'),
          actions: [
            TextButton(
              child: const Text('Cancel'),
              onPressed: () => Navigator.of(context).pop(),
            ),
            TextButton(
              child: const Text('Set Reminder'),
              onPressed: () {
                Navigator.of(context).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Reminder set for "$programTitle"'),
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