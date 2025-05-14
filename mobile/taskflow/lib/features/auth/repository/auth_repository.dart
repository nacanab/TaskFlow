import 'package:dio/dio.dart';
import 'package:taskflow/core/network/api_client.dart';
import 'package:taskflow/core/network/endpoints.dart';
import 'package:taskflow/features/auth/models/user_model.dart';

class AuthRepository {
  final ApiClient _apiClient;

  AuthRepository({required ApiClient apiClient}) : _apiClient = apiClient;

  Future<AuthResponse> login(String email, String password) async {
    try {
      final response = await _apiClient.dio.post(
        Endpoints.login,
        data: {'email': email, 'password': password},
      );
      return AuthResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'Échec de la connexion';
    }
  }

  Future<AuthResponse> register(String nom_complet, String email, String password) async {
    try {
      final response = await _apiClient.dio.post(
        Endpoints.register,
        data: {'nom_complet': nom_complet, 'email': email, 'password': password},
      );
      return AuthResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'Échec de l\'inscription';
    }
  }

  Future<User> getCurrentUser() async {
    final response = await _apiClient.dio.get(Endpoints.currentUser);
    return User.fromJson(response.data);
  }

  Future<void> logout() async {
    await _apiClient.dio.post(Endpoints.logout);
  }
}
