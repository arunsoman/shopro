import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/router/pos_router.dart';
import 'core/theme/app_theme.dart';

/// Captured from the browser URL before GoRouter initializes.
String? initialQrToken;

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  // Read BEFORE GoRouter rewrites the URL
  final base = Uri.base;
  final params = base.queryParameters;
  
  // Robust parsing: handles ?qrToken=uuid AND cases where = is encoded (?qrToken%3Duuid)
  if (params.containsKey('qrToken')) {
    initialQrToken = params['qrToken'];
  } else {
    // Look for a key that starts with 'qrToken='
    for (final key in params.keys) {
      if (key.startsWith('qrToken=')) {
        initialQrToken = key.split('=')[1];
        break;
      }
    }
  }

  debugPrint('[SHOPRO] Uri.base = $base');
  debugPrint('[SHOPRO] Uri.base.queryParameters = $params');
  debugPrint('[SHOPRO] initialQrToken = $initialQrToken');
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
