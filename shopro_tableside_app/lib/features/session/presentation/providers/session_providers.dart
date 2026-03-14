import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shopro_tableside_app/core/network/api_client.dart';

/// Holds the active tableside session for this guest.
class SessionState {
  final String tableId; // Human-readable label from QR, e.g. "W-1"
  final String? sessionId; // Real UUID from backend (null until session created)
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
  SessionState build() => const SessionState(tableId: 'Unknown');

  /// Looks up the tableside session by QR token UUID.
  /// Returns the human-readable table name on success.
  Future<String> initSession(String qrToken) async {
    final dio = ref.read(dioProvider);

    debugPrint('[Session] Scanning QR token: $qrToken');
    // Use the scan endpoint — it resolves the QR token to a session + table
    final response = await dio.get('/tableside/scan/$qrToken');
    final data = response.data as Map<String, dynamic>;
    final sessionId = data['id'] as String;
    final tableName = data['tableName'] as String? ?? qrToken;

    debugPrint('[Session] Got session: $sessionId for table: $tableName');

    state = state.copyWith(
      tableId: tableName,
      sessionId: sessionId,
      qrToken: qrToken,
    );
    return tableName;
  }
}

final sessionProvider = NotifierProvider<SessionNotifier, SessionState>(() {
  return SessionNotifier();
});
