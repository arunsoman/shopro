import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'network_config.dart';
import '../security/dpop_service.dart';
import '../../features/auth/presentation/providers/auth_provider.dart';

class ApiClient {
  late final Dio dio;
  final Ref _ref;

  ApiClient(this._ref, {String? baseUrl}) {
    final String defaultBaseUrl = NetworkConfig.baseUrl;

    dio = Dio(
      BaseOptions(
        baseUrl: baseUrl ?? defaultBaseUrl,
        connectTimeout: const Duration(seconds: 5),
        receiveTimeout: const Duration(seconds: 3),
        contentType: 'application/json',
      ),
    );

    dio.interceptors.add(LogInterceptor(requestBody: true, responseBody: true));

    // Add DPoP and Authentication Interceptor
    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        try {
          // 1. Inject Staff ID if authenticated
          final authState = _ref.read(authProvider);
          if (authState.isAuthenticated && authState.staffId != null) {
            options.headers['X-Staff-Id'] = authState.staffId;
          }

          // 2. Generate DPoP proof
          final htm = options.method;
          // Calculate HTU robustly using Dio's resolved URI
          // This ensures no double-slashes or missing slashes
          String htu = options.uri.toString();
          
          final proof = await DPoPService.generateProof(htm, htu);
          options.headers['DPoP'] = proof;
        } catch (e) {
          print('DPoP/Auth Interceptor Error: $e');
        }
        
        return handler.next(options);
      },
      onError: (DioException e, handler) {
        if (e.response?.statusCode == 401) {
          final data = e.response?.data;
          if (data is Map && data['error'] == 'invalid_dpop_proof') {
            // Target the revocation specifically
            _ref.read(authProvider.notifier).logout(
              reason: 'Your session was revoked because you logged in from another device. Please log in again.'
            );
          }
        }
        return handler.next(e);
      },
    ));
  }

  Future<Response> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    return await dio.post(path, data: data, queryParameters: queryParameters);
  }

  Future<Response> get(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) async {
    return await dio.get(path, queryParameters: queryParameters);
  }

  Future<Response> patch(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    return await dio.patch(path, data: data, queryParameters: queryParameters);
  }

  Future<Response> delete(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) async {
    return await dio.delete(path, queryParameters: queryParameters);
  }
}

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient(ref);
});
