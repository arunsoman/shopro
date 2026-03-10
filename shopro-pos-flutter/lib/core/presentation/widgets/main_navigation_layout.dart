import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';
import '../../theme/app_colors.dart';
import '../../../features/notifications/presentation/providers/notification_provider.dart';
import '../../../features/notifications/presentation/widgets/notification_center_sidebar.dart';

class MainNavigationLayout extends ConsumerStatefulWidget {
  final Widget child;
  final String location;

  const MainNavigationLayout({
    super.key,
    required this.child,
    required this.location,
  });

  @override
  ConsumerState<MainNavigationLayout> createState() =>
      _MainNavigationLayoutState();
}

class _MainNavigationLayoutState extends ConsumerState<MainNavigationLayout> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.listenManual(notificationProvider, (previous, next) {
        if (!mounted) return;
        final newCount = next.notifications.length;
        final oldCount = previous?.notifications.length ?? 0;

        if (newCount > oldCount) {
          final newNotif = next.notifications.first;
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(newNotif.message),
              behavior: SnackBarBehavior.floating,
              backgroundColor: AppColors.primary,
              action: SnackBarAction(
                label: 'View',
                textColor: Colors.white,
                onPressed: () => Scaffold.of(context).openEndDrawer(),
              ),
            ),
          );
        }
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final notificationState = ref.watch(notificationProvider);
    final count = notificationState.notifications
        .where((n) => !n.isRead)
        .length;
    final location = widget.location;

    return Scaffold(
      key: GlobalKey<ScaffoldState>(), // Key for opening drawer
      endDrawer: const NotificationCenterSidebar(),
      backgroundColor: AppColors.lightBorder,
      body: Center(
        child: Container(
          clipBehavior: Clip.antiAlias,
          decoration: const BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(color: Colors.black12, blurRadius: 20, spreadRadius: 5),
            ],
          ),
          constraints: const BoxConstraints(maxWidth: 1024, maxHeight: 1024),
          child: Column(
            children: [
              // Top Navigation Bar
              Container(
                height: 80,
                padding: const EdgeInsets.symmetric(horizontal: 24),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  border: Border(
                    bottom: BorderSide(color: AppColors.lightBorder),
                  ),
                ),
                child: Row(
                  children: [
                    // Logo
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(
                            Icons.restaurant,
                            color: Colors.white,
                            size: 24,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Text(
                          'Shopro POS',
                          style: GoogleFonts.outfit(
                            fontWeight: FontWeight.bold,
                            fontSize: 22,
                            color: AppColors.lightText,
                          ),
                        ),
                      ],
                    ),

                    const Spacer(),

                    // Center Navigation Items
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F3F5),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          _buildNavItem(
                            context,
                            'Floor Plan',
                            '/floor-plan',
                            location == '/floor-plan',
                          ),
                          _buildNavItem(
                            context,
                            'Staff',
                            '/staff-dashboard',
                            location == '/staff-dashboard',
                          ),
                          _buildNavItem(
                            context,
                            'Menu',
                            '/menu',
                            location == '/menu',
                          ),
                          _buildNavItem(
                            context,
                            'Inventory',
                            '/inventory',
                            location == '/inventory',
                          ),
                          _buildNavItem(
                            context,
                            'History',
                            '/history',
                            location == '/history',
                          ),
                          _buildNavItem(
                            context,
                            'KDS',
                            '/kds',
                            location == '/kds' || location.startsWith('/kds/'),
                          ),
                        ],
                      ),
                    ),

                    const Spacer(),

                    // Right actions
                    Row(
                      children: [
                        Container(
                          width: 160,
                          height: 40,
                          padding: const EdgeInsets.symmetric(horizontal: 10),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF8F9FA),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFFE9ECEF)),
                          ),
                          child: Row(
                            children: [
                              const Icon(
                                Icons.search,
                                color: AppColors.lightMuted,
                                size: 18,
                              ),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  'Search...',
                                  style: GoogleFonts.outfit(
                                    color: AppColors.lightMuted,
                                    fontSize: 13,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        const SizedBox(width: 12),
                        _buildNotificationBadge(context, count),
                        const SizedBox(width: 6),
                        _buildIconBtn(Icons.person_outline),
                        const SizedBox(width: 12),
                        const CircleAvatar(
                          radius: 18,
                          backgroundImage: NetworkImage(
                            'https://i.pravatar.cc/150?u=mario',
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // Main Content
              Expanded(child: widget.child),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNotificationBadge(BuildContext context, int count) {
    return Stack(
      children: [
        GestureDetector(
          onTap: () => Scaffold.of(context).openEndDrawer(),
          child: _buildIconBtn(Icons.notifications_none),
        ),
        if (count > 0)
          Positioned(
            right: 0,
            top: 0,
            child: IgnorePointer(
              child: Container(
                padding: const EdgeInsets.all(2),
                decoration: BoxDecoration(
                  color: Colors.red,
                  borderRadius: BorderRadius.circular(10),
                ),
                constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                child: Text(
                  '$count',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildNavItem(
    BuildContext context,
    String label,
    String route,
    bool active,
  ) {
    return GestureDetector(
      onTap: () => context.go(route),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
        decoration: BoxDecoration(
          color: active ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
          boxShadow: active
              ? [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Text(
          label,
          style: GoogleFonts.outfit(
            fontSize: 14,
            fontWeight: active ? FontWeight.bold : FontWeight.w500,
            color: active ? AppColors.primary : AppColors.lightMuted,
          ),
        ),
      ),
    );
  }

  Widget _buildIconBtn(IconData icon) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: const Color(0xFFF8F9FA),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Icon(icon, color: AppColors.secondary, size: 22),
    );
  }
}
