import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/router/pos_router.dart';
import 'core/theme/app_theme.dart';

/// Captured from the browser URL before GoRouter initializes.
/// GoRouter can rewrite the URL and strip query params before
/// any widget's initState runs; capturing here is the safest approach.
String? initialQrToken;

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  // Read BEFORE GoRouter rewrites the URL
  initialQrToken = Uri.base.queryParameters['qrToken'];
  runApp(const ProviderScope(child: ShoproTablesideApp()));
}

class ShoproTablesideApp extends ConsumerWidget {
  const ShoproTablesideApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'Shopro Table Assist',
      // System Theme Support
      themeMode: ThemeMode.system,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
