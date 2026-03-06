import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:shopro_tableside_app/core/theme/app_colors.dart';
import 'package:shopro_tableside_app/core/theme/app_spacing.dart';
import '../providers/session_providers.dart';

class LandingScreen extends ConsumerStatefulWidget {
  final String? tableId;
  const LandingScreen({super.key, this.tableId});

  @override
  ConsumerState<LandingScreen> createState() => _LandingScreenState();
}

class _LandingScreenState extends ConsumerState<LandingScreen> {
  bool _isLoading = false;
  String? _error;

  Future<void> _startOrdering() async {
    final tableName = widget.tableId ?? 'W-1';
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      await ref.read(sessionProvider.notifier).initSession(tableName);
      if (mounted) context.go('/menu');
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _error = 'Could not connect to the server. Please try again.';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final tableName = widget.tableId ?? 'W-1';

    return Scaffold(
      body: Stack(
        children: [
          // Background Gradient
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [AppColors.primary, AppColors.primaryDark],
              ),
            ),
          ),

          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(AppSpacing.l),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Logo
                    Container(
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.1),
                            blurRadius: 8,
                            spreadRadius: 1,
                          ),
                        ],
                      ),
                      child: ClipOval(
                        child: Image.asset(
                          'assets/images/logo.jpeg',
                          width: 120,
                          height: 120,
                          fit: BoxFit.cover,
                        ),
                      ),
                    ).animate().scale(delay: 200.ms).fadeIn(),

                    const SizedBox(height: AppSpacing.xl),

                    Text(
                      'Welcome to Shopro',
                      style: Theme.of(context).textTheme.headlineMedium
                          ?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                    ).animate().slideY(begin: 0.2).fadeIn(delay: 400.ms),

                    const SizedBox(height: AppSpacing.s),

                    Text(
                      'Table Assist',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: Colors.white.withValues(alpha: 0.8),
                        letterSpacing: 4,
                      ),
                    ).animate().fadeIn(delay: 600.ms),

                    const SizedBox(height: AppSpacing.xxl),

                    // Table Card
                    Card(
                      elevation: 8,
                      shadowColor: Colors.black26,
                      color: isDark ? AppColors.darkSurface : Colors.white,
                      child: Padding(
                        padding: const EdgeInsets.all(AppSpacing.xl),
                        child: Column(
                          children: [
                            Text(
                              'You are at Table',
                              style: Theme.of(context).textTheme.bodyMedium
                                  ?.copyWith(
                                    color: isDark
                                        ? AppColors.darkTextSecondary
                                        : AppColors.lightTextSecondary,
                                  ),
                            ),
                            const SizedBox(height: AppSpacing.s),
                            Text(
                              tableName,
                              style: Theme.of(context).textTheme.displayMedium
                                  ?.copyWith(
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.primary,
                                  ),
                            ),
                            const SizedBox(height: AppSpacing.l),
                            if (_error != null) ...[
                              const Divider(),
                              Padding(
                                padding: const EdgeInsets.symmetric(
                                  vertical: AppSpacing.s,
                                ),
                                child: Row(
                                  children: [
                                    const Icon(
                                      LucideIcons.alertCircle,
                                      color: Colors.red,
                                      size: 18,
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        _error!,
                                        style: const TextStyle(
                                          color: Colors.red,
                                          fontSize: 13,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                            const Divider(),
                            const SizedBox(height: AppSpacing.l),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: _isLoading ? null : _startOrdering,
                                child: _isLoading
                                    ? const SizedBox(
                                        height: 20,
                                        width: 20,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          color: Colors.white,
                                        ),
                                      )
                                    : const Text('Start Ordering'),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ).animate().slideY(begin: 0.1, delay: 800.ms).fadeIn(),

                    const SizedBox(height: AppSpacing.xl),

                    Text(
                      'Ready for an amazing meal?',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.7),
                      ),
                    ).animate().fadeIn(delay: 1.seconds),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
