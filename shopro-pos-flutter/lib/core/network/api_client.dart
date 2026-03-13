import 'package:dio/dio.dart';
import 'network_config.dart';
import '../security/dpop_service.dart';

class ApiClient {
  late final Dio dio;

  ApiClient({String? baseUrl}) {
    // Dual-Mode Base URL for seamless local dev vs docker/prod
    // In local web dev, we point directly to the backend to bypass the missing proxy.
    // In Docker/Release, we use relative paths to leverage Nginx/Proxy.
    final String defaultBaseUrl = NetworkConfig.baseUrl;

    dio = Dio(
      BaseOptions(
        baseUrl: baseUrl ?? defaultBaseUrl,
        connectTimeout: const Duration(seconds: 5),
        receiveTimeout: const Duration(seconds: 3),
        contentType: 'application/json',
      ),
    );

    // Add logging interceptor for easier debugging
    dio.interceptors.add(LogInterceptor(requestBody: true, responseBody: true));

    // Add DPoP Interceptor for FAPI 2.0 Compliance
    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        final htm = options.method;
        final htu = '${dio.options.baseUrl}${options.path}';
        
        // Generate DPoP hint/proof
        final proof = DPoPService.generateProof(htm, htu);
        options.headers['DPoP'] = proof;
        
        return handler.next(options);
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

final apiClient = ApiClient();
