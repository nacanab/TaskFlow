class Endpoints {
  static const String baseUrl = 'http://127.0.0.1/api/v1';

  // Pour l'authentification
  static const String login = '$baseUrl/login';
  static const String register = '$baseUrl/register';
  static const String logout = '$baseUrl/logout';
  static const String currentUser = '$baseUrl/users/get_user';
}
