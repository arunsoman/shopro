import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/repositories/auth_repository.dart';

class AuthState {
  final bool isAuthenticated;
  final String? staffName;
  final String? role;
  final String? staffId;
  final Set<String> permissions;

  AuthState({
    required this.isAuthenticated,
    this.staffName,
    this.role,
    this.staffId,
    this.permissions = const {},
  });

  factory AuthState.initial() => AuthState(isAuthenticated: false);

  AuthState copyWith({
    bool? isAuthenticated,
    String? staffName,
    String? role,
    String? staffId,
    Set<String>? permissions,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      staffName: staffName ?? this.staffName,
      role: role ?? this.role,
      staffId: staffId ?? this.staffId,
      permissions: permissions ?? this.permissions,
    );
  }
}

class AuthNotifier extends Notifier<AuthState> {
  @override
  AuthState build() => AuthState.initial();

  Future<bool> login(String pin) async {
    try {
      final result = await authRepository.login(pin);
      state = state.copyWith(
        isAuthenticated: true,
        staffName: result['fullName'],
        role: result['role'],
        staffId: result['id'],
        permissions: (result['permissions'] as List<dynamic>?)
                ?.map((e) => e.toString())
                .toSet() ??
            {},
      );
      return true;
    } catch (e) {
      state = AuthState.initial();
      return false;
    }
  }

  void logout() {
    state = AuthState.initial();
  }

  /// Returns the landing page route based on user permissions.
  String getLandingPage() {
    if (!state.isAuthenticated) return '/login';
    
    // Always prioritize Floor Plan for FOH, KDS for BOH, etc.
    final permitted = getPermittedRoutes();
    if (permitted.isEmpty) return '/login'; // Or an error screen

    // Prioritization: Floor Plan -> KDS -> Inventory -> History
    if (permitted.contains('/floor-plan')) return '/floor-plan';
    if (permitted.contains('/kds')) return '/kds';
    if (permitted.contains('/inventory')) return '/inventory';
    
    return permitted.first;
  }

  List<String> getPermittedRoutes() {
    if (!state.isAuthenticated) return [];
    if (state.role == 'OWNER') {
      return ['/floor-plan', '/staff-dashboard', '/menu', '/inventory', '/history', '/kds'];
    }

    final mapping = {
      '/floor-plan': 'FLOOR:TABLE_ASSIGN',
      '/staff-dashboard': 'ORDER:VIEW_ALL',
      '/menu': 'ORDER:CREATE',
      '/inventory': 'INVENTORY:VIEW',
      '/history': 'ORDER:VIEW_ALL',
      '/kds': 'KDS:VIEW',
    };

    return mapping.entries
        .where((e) => state.permissions.contains(e.value))
        .map((e) => e.key)
        .toList();
  }
}

final authProvider = NotifierProvider<AuthNotifier, AuthState>(
  AuthNotifier.new,
);
