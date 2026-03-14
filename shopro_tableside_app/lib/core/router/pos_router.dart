import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shopro_tableside_app/features/session/presentation/screens/landing_screen.dart';
import 'package:shopro_tableside_app/features/menu/presentation/screens/guest_menu_screen.dart';
import 'package:shopro_tableside_app/features/menu/presentation/screens/cart_screen.dart';
import 'package:shopro_tableside_app/features/payment/presentation/screens/checkout_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) {
          final qrToken = state.uri.queryParameters['qrToken'];
          return LandingScreen(qrToken: qrToken);
        },
      ),
      // QR code URLs: https://tableasist.afriqpay.com/scan/{uuid}
      GoRoute(
        path: '/scan/:qrToken',
        builder: (context, state) {
          final qrToken = state.pathParameters['qrToken']!;
          return LandingScreen(qrToken: qrToken);
        },
      ),
      GoRoute(
        path: '/menu',
        builder: (context, state) => const GuestMenuScreen(),
      ),
      GoRoute(path: '/cart', builder: (context, state) => const CartScreen()),
      GoRoute(
        path: '/checkout',
        builder: (context, state) => const CheckoutScreen(),
      ),
    ],
  );
});
