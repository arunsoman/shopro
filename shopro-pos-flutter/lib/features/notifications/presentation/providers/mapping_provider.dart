import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import '../../../../core/network/network_config.dart';
import '../../data/models/mapping_model.dart';

class MappingState {
  final List<NotificationRecipientMapping> mappings;
  final bool isLoading;
  final String? error;

  MappingState({required this.mappings, this.isLoading = false, this.error});

  MappingState copyWith({
    List<NotificationRecipientMapping>? mappings,
    bool? isLoading,
    String? error,
  }) {
    return MappingState(
      mappings: mappings ?? this.mappings,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

class MappingNotifier extends StateNotifier<MappingState> {
  final String _baseUrl = '${NetworkConfig.baseUrl}/v1/notifications/mappings';

  MappingNotifier() : super(MappingState(mappings: [])) {
    loadMappings();
  }

  Future<void> loadMappings() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await http.get(Uri.parse(_baseUrl));
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        state = state.copyWith(
          mappings: data
              .map((m) => NotificationRecipientMapping.fromMap(m))
              .toList(),
          isLoading: false,
        );
      } else {
        throw Exception('Failed to load mappings');
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> addMapping(
    String notificationType,
    String recipientType,
    String recipientId,
  ) async {
    try {
      final response = await http.post(
        Uri.parse(_baseUrl),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'notificationType': notificationType,
          'recipientType': recipientType,
          'recipientId': recipientId,
        }),
      );
      if (response.statusCode == 201) {
        final newMapping = NotificationRecipientMapping.fromMap(
          json.decode(response.body),
        );
        state = state.copyWith(mappings: [...state.mappings, newMapping]);
      } else {
        throw Exception('Failed to add mapping');
      }
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  Future<void> deleteMapping(String id) async {
    try {
      final response = await http.delete(Uri.parse('$_baseUrl/$id'));
      if (response.statusCode == 204) {
        state = state.copyWith(
          mappings: state.mappings.where((m) => m.id != id).toList(),
        );
      } else {
        throw Exception('Failed to delete mapping');
      }
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }
}

final notificationMappingProvider =
    StateNotifierProvider<MappingNotifier, MappingState>((ref) {
      return MappingNotifier();
    });
