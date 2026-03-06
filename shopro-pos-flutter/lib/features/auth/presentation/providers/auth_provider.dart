import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/repositories/auth_repository.dart';

class AuthState {
  final bool isAuthenticated;
  final String? staffName;
  final String? role;
  final String? staffId;

  AuthState({
    required this.isAuthenticated,
    this.staffName,
    this.role,
    this.staffId,
  });

  factory AuthState.initial() => AuthState(isAuthenticated: false);

  AuthState copyWith({
    bool? isAuthenticated,
    String? staffName,
    String? role,
    String? staffId,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      staffName: staffName ?? this.staffName,
      role: role ?? this.role,
      staffId: staffId ?? this.staffId,
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
}

final authProvider = NotifierProvider<AuthNotifier, AuthState>(
  AuthNotifier.new,
);
