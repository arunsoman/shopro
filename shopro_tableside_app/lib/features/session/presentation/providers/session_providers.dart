import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';

/// Holds the active tableside session for this guest.
class SessionState {
  final String tableId; // Human-readable label from QR, e.g. "W-1"
  final String?
  sessionId; // Real UUID from backend (null until session created)
  final String? qrToken;

  const SessionState({required this.tableId, this.sessionId, this.qrToken});

  bool get hasSession => sessionId != null;

  SessionState copyWith({String? tableId, String? sessionId, String? qrToken}) {
    return SessionState(
      tableId: tableId ?? this.tableId,
      sessionId: sessionId ?? this.sessionId,
      qrToken: qrToken ?? this.qrToken,
    );
  }
}

class SessionNotifier extends Notifier<SessionState> {
  @override
  SessionState build() => const SessionState(tableId: 'W-1');

  /// Creates (or reuses) a backend session for the given table name.
  /// Returns the real sessionId UUID on success.
  Future<String> initSession(String tableName) async {
    state = state.copyWith(tableId: tableName);

    const apiBase = String.fromEnvironment(
      'API_BASE_URL',
      defaultValue: '/api/v1/tableside',
    );

    final dio = Dio(
      BaseOptions(
        baseUrl: apiBase,
        connectTimeout: const Duration(seconds: 8),
        receiveTimeout: const Duration(seconds: 8),
      ),
    );

    debugPrint('[Session] Creating session for table: $tableName');
    final response = await dio.post('/session/by-name/$tableName');
    final sessionId = response.data['id'] as String;
    debugPrint('[Session] Got sessionId: $sessionId');

    state = state.copyWith(tableId: tableName, sessionId: sessionId);
    return sessionId;
  }
}

final sessionProvider = NotifierProvider<SessionNotifier, SessionState>(() {
  return SessionNotifier();
});
