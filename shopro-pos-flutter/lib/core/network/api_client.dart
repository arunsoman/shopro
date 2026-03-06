import 'package:dio/dio.dart';

class ApiClient {
  late final Dio dio;

  ApiClient({String? baseUrl}) {
    dio = Dio(
      BaseOptions(
        baseUrl: baseUrl ?? '/api/v1',
        connectTimeout: const Duration(seconds: 5),
        receiveTimeout: const Duration(seconds: 3),
      ),
    );

    // Add logging interceptor for easier debugging
    dio.interceptors.add(LogInterceptor(requestBody: true, responseBody: true));
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
