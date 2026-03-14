import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shopro_tableside_app/core/network/api_client.dart';

import 'package:shopro_tableside_app/core/persistence/persistence_provider.dart';

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
  SessionState build() {
    final prefs = ref.watch(sharedPreferencesProvider);
    final savedSessionId = prefs.getString('sessionId');
    final savedTableId = prefs.getString('tableId') ?? 'Unknown';
    final savedQrToken = prefs.getString('qrToken');

    if (savedSessionId != null) {
      debugPrint('[Session] Recovered session $savedSessionId for table $savedTableId');
    }

    return SessionState(
      tableId: savedTableId,
      sessionId: savedSessionId,
      qrToken: savedQrToken,
    );
  }

  /// Looks up the tableside session by QR token UUID.
  /// Returns the human-readable table name on success.
  Future<String> initSession(String qrToken) async {
    final dio = ref.read(dioProvider);
    final prefs = ref.read(sharedPreferencesProvider);

    debugPrint('[Session] Scanning QR token: $qrToken');
    // Use the scan endpoint — it resolves the QR token to a session + table
    final response = await dio.get('/tableside/scan/$qrToken');
    final data = response.data as Map<String, dynamic>;
    final sessionId = data['id'] as String;
    final tableName = data['tableName'] as String? ?? qrToken;

    debugPrint('[Session] Got session: $sessionId for table: $tableName');

    // Persist session
    await prefs.setString('sessionId', sessionId);
    await prefs.setString('tableId', tableName);
    await prefs.setString('qrToken', qrToken);

    state = state.copyWith(
      tableId: tableName,
      sessionId: sessionId,
      qrToken: qrToken,
    );
    return tableName;
  }

  Future<void> clearSession() async {
    final prefs = ref.read(sharedPreferencesProvider);
    await prefs.remove('sessionId');
    await prefs.remove('tableId');
    await prefs.remove('qrToken');
    state = const SessionState(tableId: 'Unknown');
  }
}

final sessionProvider = NotifierProvider<SessionNotifier, SessionState>(() {
  return SessionNotifier();
});
