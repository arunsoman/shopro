import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shopro_tableside_app/core/security/dpop_service.dart';

final dioProvider = Provider<Dio>((ref) {
  // The tableside nginx proxy forwards /api/ to the backend server container.
  // Using a relative base URL ensures this works in all environments without
  // needing to hardcode an absolute host (which breaks on guests' devices).
  const apiBase = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: '/api/v1',
  );

  final dio = Dio(
    BaseOptions(
      baseUrl: apiBase,
      connectTimeout: const Duration(seconds: 8),
      receiveTimeout: const Duration(seconds: 8),
    ),
  );

  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) async {
      try {
        final url = '${options.baseUrl}${options.path}';
        final proof = DPoPService.generateProof(options.method, url);
        options.headers['DPoP'] = proof;
      } catch (e) {
        // Log or handle error
      }
      return handler.next(options);
    },
  ));

  return dio;
});
