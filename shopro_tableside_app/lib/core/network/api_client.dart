import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shopro_tableside_app/core/security/dpop_service.dart';

final dioProvider = Provider<Dio>((ref) {
  // Prefer a fully-qualified URL injected at build time.
  // Falls back to constructing one from separate host/port args.
  const apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: '',
  );
  const apiHost = String.fromEnvironment(
    'API_HOST',
    defaultValue: 'web.afriqpay.com',
  );
  const apiPort = String.fromEnvironment(
    'API_PORT',
    defaultValue: '',
  );

  final String computedBase;
  if (apiBaseUrl.isNotEmpty) {
    computedBase = apiBaseUrl;
  } else if (apiPort.isNotEmpty && apiPort != '443' && apiPort != '80') {
    // Non-standard port: include it explicitly
    computedBase = 'https://$apiHost:$apiPort/api/v1';
  } else {
    // Standard HTTPS port — no port suffix needed
    computedBase = 'https://$apiHost/api/v1';
  }

  final dio = Dio(
    BaseOptions(
      baseUrl: computedBase,
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
