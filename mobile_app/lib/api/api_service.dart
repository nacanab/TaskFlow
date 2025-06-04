import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'http://127.0.0.1:8000/api/v1';

  static Future<Map<String, dynamic>> getUserProfile() async {
    final token = 'votre_token'; // à remplacer dynamiquement selon ton app
    final response = await http.get(
      Uri.parse('$baseUrl/user'), // ou /me selon ton backend
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Erreur de chargement du profil');
    }
  }
}
