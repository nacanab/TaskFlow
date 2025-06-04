import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../api/api_service.dart';
import 'package:http/http.dart' as http;

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? userData;
  List<dynamic> userSkills = [];
  List<dynamic> allCompetences = [];
  bool isLoading = true;
  bool isSaving = false;

  @override
  void initState() {
    super.initState();
    _loadUserData();
    _fetchUserCompetences();
    _fetchAllCompetences();
  }

  Future<void> _loadUserData() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    try {
      final data = jsonDecode(prefs.getString('user') ?? '{}');
      setState(() {
        userData = data;
        // Note: les compétences seront chargées via l'API dédiée
        isLoading = false;
      });
    } catch (e) {
      debugPrint('Erreur lors du chargement des données utilisateur: $e');
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> _fetchUserCompetences() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');

    if (token == null) return;

    try {
      final response = await http.get(
        Uri.parse('http://127.0.0.1:8000/api/v1/competences/'),
        headers: {
          'Authorization': 'Bearer $token',
          'Accept': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        // Récupérer la liste des compétences de l'utilisateur
        final List<dynamic> competences = data['competences'] ?? [];
        setState(() {
          userSkills = competences;

          // Mettre à jour les données utilisateur en mémoire
          if (userData != null) {
            userData!['competences'] = userSkills;
            prefs.setString('user', jsonEncode(userData));
          }
        });
      } else {
        debugPrint('Erreur API compétences utilisateur: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('Erreur lors de la récupération des compétences utilisateur: $e');
    }
  }

  Future<void> _fetchAllCompetences() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    try {
      final response = await http.get(
        Uri.parse('http://127.0.0.1:8000/api/v1/competences/all'),
        headers: {
          'Authorization': 'Bearer $token',
          'Accept': 'application/json',
        },
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        // Récupérer la liste des compétences depuis la clé 'competences'
        final List<dynamic> competences = data['competences'] ?? [];
        setState(() {
          allCompetences = competences;
        });
      } else {
        debugPrint('Erreur API: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('Erreur lors de la récupération des compétences: $e');
    }
  }

  Future<void> _addCompetence(Map<String, dynamic> competence) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    final userId = userData?['id'];

    if (token == null || userId == null) return;

    setState(() {
      isSaving = true;
    });

    try {
      final response = await http.post(
        Uri.parse('http://127.0.0.1:8000/api/v1/competences/create'),
        headers: {
          'Authorization': 'Bearer $token',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'competences': [competence],
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        // Après l'ajout, rafraîchir la liste des compétences de l'utilisateur
        await _fetchUserCompetences();

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Compétence "${competence['libelle'] ?? competence['name']}" ajoutée avec succès')),
        );
      } else {
        debugPrint('Erreur lors de l\'ajout de compétence: ${response.statusCode}');
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Erreur lors de l\'ajout de la compétence')),
        );
      }
    } catch (e) {
      debugPrint('Exception lors de l\'ajout de compétence: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Erreur de connexion')),
      );
    } finally {
      setState(() {
        isSaving = false;
      });
    }
  }

  Future<void> _removeCompetence(Map<String, dynamic> competence) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    final userId = userData?['id'];

    if (token == null || userId == null) return;

    setState(() {
      isSaving = true;
    });

    try {
      final response = await http.delete(
        Uri.parse('http://127.0.0.1:8000/api/v1/competences/${competence['id']}'),
        headers: {
          'Authorization': 'Bearer $token',
          'Accept': 'application/json',
        },
      );

      if (response.statusCode == 200 || response.statusCode == 204) {
        // Après la suppression, rafraîchir la liste des compétences de l'utilisateur
        await _fetchUserCompetences();

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Compétence "${competence['libelle'] ?? competence['name']}" retirée avec succès')),
        );
      } else {
        debugPrint('Erreur lors de la suppression de compétence: ${response.statusCode}');
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Erreur lors de la suppression de la compétence')),
        );
      }
    } catch (e) {
      debugPrint('Exception lors de la suppression de compétence: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Erreur de connexion')),
      );
    } finally {
      setState(() {
        isSaving = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text("Mon Profil"),
        backgroundColor: Colors.blue.shade800,
        elevation: 0,
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildProfileHeader(),
                _buildUserInfoSection(),
                _buildSkillsSection(),
                _buildAllCompetencesSection(),
                const SizedBox(height: 20), // Add padding at the bottom
              ],
            ),
          ),
          if (isSaving)
            Container(
              color: Colors.black.withOpacity(0.3),
              child: const Center(
                child: CircularProgressIndicator(),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildProfileHeader() {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.blue.shade800,
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(30),
          bottomRight: Radius.circular(30),
        ),
      ),
      child: Column(
        children: [
          const SizedBox(height: 20),
          CircleAvatar(
            radius: 50,
            backgroundColor: Colors.white,
            backgroundImage: userData?['photo_profil'] != null
                ? NetworkImage('http://localhost:8000/${userData?['photo_profil']}')
                : null,
            child: userData?['photo_profil'] == null
                ? Icon(Icons.person, size: 50, color: Colors.blue)
                : null,
          ),

          const SizedBox(height: 10),
          Text(
            userData?['nom_complet'] ?? "Utilisateur",
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 5),
          Text(
            userData?['email'] ?? "",
            style: TextStyle(
              fontSize: 16,
              color: Colors.white.withOpacity(0.9),
            ),
          ),
          const SizedBox(height: 30),
        ],
      ),
    );
  }

  Widget _buildUserInfoSection() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Informations personnelles",
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.blue,
            ),
          ),
          const SizedBox(height: 15),
          _buildInfoRow(Icons.person, "Nom complet", userData?['nom_complet'] ?? "Non renseigné"),
          _buildInfoRow(Icons.email, "Email", userData?['email'] ?? "Non renseigné"),
          _buildInfoRow(Icons.phone, "Téléphone", userData?['telephone'] ?? "Non renseigné"),
          // Ajoutez d'autres informations si nécessaire
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.blue.shade100,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: Colors.blue.shade800),
          ),
          const SizedBox(width: 15),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey.shade600,
                ),
              ),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSkillsSection() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Mes compétences",
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.blue,
            ),
          ),
          const SizedBox(height: 10),
          userSkills.isEmpty
              ? const Text(
            "Aucune compétence ajoutée",
            style: TextStyle(
              fontSize: 16,
              fontStyle: FontStyle.italic,
              color: Colors.grey,
            ),
          )
              : Wrap(
            spacing: 8,
            runSpacing: 8,
            children: userSkills.map((skill) {
              return Chip(
                backgroundColor: Colors.blue.shade100,
                label: Text(
                  skill['libelle'] ?? skill['name'] ?? "Compétence",
                  style: TextStyle(color: Colors.blue.shade800),
                ),
                deleteIcon: const Icon(Icons.close, size: 18),
                onDeleted: () => _removeCompetence(skill),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildAllCompetencesSection() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Ajouter des compétences",
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.blue,
            ),
          ),
          const SizedBox(height: 10),
          allCompetences.isEmpty
              ? const Center(child: CircularProgressIndicator())
              : Wrap(
            spacing: 8,
            runSpacing: 8,
            children: allCompetences.map((competence) {
              final bool isSelected = userSkills.any((s) => s['id'] == competence['id']);
              return FilterChip(
                backgroundColor: isSelected ? Colors.green.shade100 : Colors.grey.shade200,
                label: Text(
                  competence['libelle'] ?? competence['name'] ?? "Compétence",
                  style: TextStyle(
                    color: isSelected ? Colors.green.shade800 : Colors.grey.shade800,
                  ),
                ),
                selected: isSelected,
                onSelected: (bool selected) {
                  if (selected && !isSelected) {
                    _addCompetence(competence);
                  } else if (!selected && isSelected) {
                    _removeCompetence(competence);
                  }
                },
                avatar: isSelected
                    ? const Icon(Icons.check, size: 18, color: Colors.green)
                    : null,
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}