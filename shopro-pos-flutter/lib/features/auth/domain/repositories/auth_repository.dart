import '../../../../core/network/api_client.dart';

abstract class AuthRepository {
  Future<Map<String, dynamic>> login(String pin);
}

class AuthRepositoryImpl implements AuthRepository {
  final ApiClient _client;

  AuthRepositoryImpl(this._client);

  @override
  Future<Map<String, dynamic>> login(String pin) async {
    final response = await _client.post('/auth/login', data: {'pin': pin});
    if (response.statusCode == 200) {
      return response.data as Map<String, dynamic>;
    } else {
      throw Exception('Failed to login: ${response.statusMessage}');
    }
  }
}

final authRepository = AuthRepositoryImpl(apiClient);
