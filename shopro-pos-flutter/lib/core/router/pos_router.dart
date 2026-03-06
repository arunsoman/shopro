import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/auth/presentation/providers/auth_provider.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/floor_plan/presentation/screens/floor_plan_screen.dart';
import '../../features/order/presentation/screens/order_course_management_screen.dart';
import '../../features/menu/presentation/screens/menu_navigation_screen.dart';
import '../../features/order/presentation/screens/checkout_screen.dart';
import '../../features/order/presentation/screens/order_history_screen.dart';
import '../../features/order/presentation/screens/staff_dashboard_screen.dart';
import '../../features/floor_plan/presentation/screens/table_dashboard_screen.dart';
import '../../features/floor_plan/domain/models/floor_models.dart';
import '../../features/order/domain/models/order_models.dart';
import '../../features/kds/presentation/screens/kds_station_selection_screen.dart';
import '../../features/kds/presentation/screens/kds_queue_screen.dart';
import '../../features/kds/presentation/providers/kds_provider.dart';
import '../../features/kds/domain/models/kds_models.dart';
import '../presentation/widgets/main_navigation_layout.dart';
import 'package:flutter/material.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final listenable = RouterListenable(ref);

  return GoRouter(
    // Avoid '/' as initial location — use a named path to prevent prefix matching issues
    initialLocation: '/login',
    refreshListenable: listenable,
    redirect: (context, state) {
      final authState = ref.read(authProvider);
      // Always use state.uri.path — it is the fully-resolved path,
      // unlike state.matchedLocation which can be partial during redirect cycles.
      final path = state.uri.path;
      final isOnLogin = path == '/login';

      if (!authState.isAuthenticated) {
        return isOnLogin ? null : '/login';
      }

      // Authenticated: if trying to go to /login, send to floor plan
      if (isOnLogin) {
        return '/floor-plan';
      }

      return null;
    },
    routes: [
      // /login is first — a distinct path that cannot be confused with others
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),

      // All app routes use /floor as the "home" — never '/' — to avoid
      // the go_router assertion where '/' pattern-matches every URI as a prefix.
      GoRoute(
        path: '/floor-plan',
        builder: (context, state) => MainNavigationLayout(
          location: state.uri.path,
          child: const FloorPlanScreen(),
        ),
      ),
      GoRoute(
        path: '/orders',
        builder: (context, state) {
          final order = state.extra as OrderTicket?;
          return MainNavigationLayout(
            location: state.uri.path,
            child: OrderCourseManagementScreen(order: order),
          );
        },
      ),
      GoRoute(
        path: '/menu',
        builder: (context, state) => MainNavigationLayout(
          location: state.uri.path,
          child: const MenuNavigationScreen(),
        ),
      ),
      GoRoute(
        path: '/checkout',
        builder: (context, state) => MainNavigationLayout(
          location: state.uri.path,
          child: const CheckoutScreen(),
        ),
      ),
      GoRoute(
        path: '/inventory',
        builder: (context, state) => MainNavigationLayout(
          location: state.uri.path,
          child: const Scaffold(body: Center(child: Text('Inventory Screen'))),
        ),
      ),
      GoRoute(
        path: '/history',
        builder: (context, state) => MainNavigationLayout(
          location: state.uri.path,
          child: const OrderHistoryScreen(),
        ),
      ),
      GoRoute(
        path: '/staff-dashboard',
        builder: (context, state) => MainNavigationLayout(
          location: state.uri.path,
          child: const StaffDashboardScreen(),
        ),
      ),
      GoRoute(
        path: '/table-dashboard',
        builder: (context, state) {
          final table = state.extra as TableInfo;
          return MainNavigationLayout(
            location: state.uri.path,
            child: TableDashboardScreen(table: table),
          );
        },
      ),
      GoRoute(
        path: '/kds',
        builder: (context, state) => MainNavigationLayout(
          location: state.uri.path,
          child: const KDSStationSelectionScreen(),
        ),
      ),
      GoRoute(
        path: '/kds/queue/:stationId',
        builder: (context, state) {
          final stationId = state.pathParameters['stationId']!;
          final station = state.extra as KDSStation?;

          Widget queue;
          if (station != null) {
            queue = KDSQueueScreen(
              stationId: station.id,
              stationName: station.name,
            );
          } else {
            queue = FutureBuilder<KDSStation>(
              future: ref.read(kdsRepositoryProvider).getStationById(stationId),
              builder: (context, snapshot) {
                if (snapshot.hasData) {
                  return KDSQueueScreen(
                    stationId: snapshot.data!.id,
                    stationName: snapshot.data!.name,
                  );
                }
                if (snapshot.hasError) {
                  return Scaffold(
                    body: Center(child: Text('Error: ${snapshot.error}')),
                  );
                }
                return const Scaffold(
                  body: Center(child: CircularProgressIndicator()),
                );
              },
            );
          }

          return MainNavigationLayout(location: state.uri.path, child: queue);
        },
      ),
    ],
  );
});

class RouterListenable extends ChangeNotifier {
  final Ref _ref;

  RouterListenable(this._ref) {
    _ref.listen(authProvider, (previous, next) {
      if (previous?.isAuthenticated != next.isAuthenticated) {
        notifyListeners();
      }
    });
  }
}
