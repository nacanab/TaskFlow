class User {
  final int id;
  final String nom_complet;
  final String email;

  User({required this.id, required this.nom_complet, required this.email});

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      nom_complet: json['nom_complet'],
      email: json['email'],
    );
  }
}

class AuthResponse {
  final String token;
  final User user;

  AuthResponse({required this.token, required this.user});

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      token: json['token'] ?? json['access_token'],
      user: User.fromJson(json['user']),
    );
  }
}
