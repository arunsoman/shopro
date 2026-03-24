import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/router/pos_router.dart';
import 'core/theme/app_theme.dart';

class ShoproPosApp extends ConsumerWidget {
  const ShoproPosApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return Container(
      constraints: const BoxConstraints.expand(),
      color: const Color(0xFFF8F9FA), // Use a color that matches the app background instead of black
      child: FittedBox(
        fit: BoxFit.fitWidth,
        alignment: Alignment.topCenter,
        child: SizedBox(
          width: 1280,
          height: 800,
          child: MaterialApp.router(
            title: 'Shopro POS',
            theme: AppTheme.lightTheme,
            routerConfig: router,
            debugShowCheckedModeBanner: false,
          ),
        ),
      ),
    );
  }
}
