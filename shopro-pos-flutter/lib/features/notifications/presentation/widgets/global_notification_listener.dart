import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../providers/notification_provider.dart';
import '../../data/models/notification_model.dart';
import '../../../../core/theme/app_colors.dart';

class GlobalNotificationListener extends ConsumerStatefulWidget {
  final Widget child;

  const GlobalNotificationListener({
    super.key,
    required this.child,
  });

  @override
  ConsumerState<GlobalNotificationListener> createState() =>
      _GlobalNotificationListenerState();
}

class _GlobalNotificationListenerState
    extends ConsumerState<GlobalNotificationListener> {
  StreamSubscription? _subscription;

  @override
  void initState() {
    super.initState();
    _setupListener();
  }

  void _setupListener() {
    // We use ref.read().newNotifications because we want to listen to the stream
    // without rebuilding the whole widget tree on every state change.
    _subscription = ref.read(notificationProvider.notifier).newNotifications.listen((notification) {
      if (!mounted) return;
      _showNotificationSnackbar(notification);
    });
  }

  void _showNotificationSnackbar(InAppNotification notification) {
    Color bgColor = AppColors.primary;
    IconData icon = Icons.notifications;

    // Map category to visual styles
    switch (notification.category) {
      case 'TABLE_DIRTY':
        bgColor = Colors.deepOrange;
        icon = Icons.cleaning_services;
        break;
      case 'TABLE_VACANT':
        bgColor = Colors.green;
        icon = Icons.check_circle;
        break;
      case 'TABLE_OCCUPIED':
        bgColor = Colors.blue;
        icon = Icons.restaurant;
        break;
      case 'READY_FOR_SERVICE':
        bgColor = Colors.purple;
        icon = Icons.room_service;
        break;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(icon, color: Colors.white, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    notification.title,
                    style: GoogleFonts.outfit(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                  Text(
                    notification.message,
                    style: GoogleFonts.outfit(fontSize: 12),
                  ),
                ],
              ),
            ),
            IconButton(
              icon: const Icon(Icons.close, color: Colors.white70, size: 18),
              onPressed: () {
                ref.read(notificationProvider.notifier).dismiss(notification.id);
                ScaffoldMessenger.of(context).hideCurrentSnackBar();
              },
            ),
          ],
        ),
        behavior: SnackBarBehavior.floating,
        backgroundColor: bgColor,
        margin: const EdgeInsets.all(20),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        action: SnackBarAction(
          label: 'Details',
          textColor: Colors.white,
          onPressed: () {
            // Logic to open the drawer
            Scaffold.of(context).openEndDrawer();
          },
        ),
      ),
    );
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
}
