import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

// Modèles de données
class Projet {
  final int id;
  final String titre;

  Projet({required this.id, required this.titre});

  factory Projet.fromJson(Map<String, dynamic> json) {
    return Projet(
      id: json['id'],
      titre: json['titre'],
    );
  }
}

class Tache {
  final int id;
  final String titre;
  final String description;
  final String priorite;
  final String statut;
  final String dateDebut;
  final String dateFin;
  final int projetId;
  bool isExpanded;

  Tache({
    required this.id,
    required this.titre,
    required this.description,
    required this.priorite,
    required this.statut,
    required this.dateDebut,
    required this.dateFin,
    required this.projetId,
    this.isExpanded = false,
  });

  factory Tache.fromJson(Map<String, dynamic> json) {
    return Tache(
      id: json['id'],
      titre: json['titre'],
      description: json['description'] ?? '',
      priorite: json['priorite'] ?? 'Normale',
      statut: json['statut'] ?? 'À faire',
      dateDebut: json['date_debut'],
      dateFin: json['date_fin'],
      projetId: json['projet_id'],
    );
  }
}

class TasksPage extends StatefulWidget {
  const TasksPage({super.key});
  @override
  _TasksPageState createState() => _TasksPageState();
}

class _TasksPageState extends State<TasksPage> {
  final storage = FlutterSecureStorage();
  final String baseUrl = 'http://localhost:8000/api/v1';

  List<Projet> projets = [];
  List<Tache> taches = [];
  String activeFilter = 'all';
  bool isLoading = true;
  String? errorMessage;
  int? currentUserId;

  @override
  void initState() {
    super.initState();
    _loadUserAndTasks();
  }

  Future<void> _loadUserAndTasks() async {
    try {
      setState(() {
        isLoading = true;
        errorMessage = null;
      });

      // Récupérer l'utilisateur courant
      final user = await _getCurrentUser();
      setState(() {
        currentUserId = user['id'];
      });

      // Récupérer les tâches de l'utilisateur
      await _fetchUserTasks(currentUserId!);
    } catch (e) {
      setState(() {
        errorMessage = 'Erreur lors du chargement des données. Veuillez réessayer.';
      });
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<Map<String, dynamic>> _getCurrentUser() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    final data = jsonDecode(prefs.getString('user') ?? '{}');
    return data;
  }

  Future<void> _fetchUserTasks(int userId) async {
    final token = await storage.read(key: 'token');
    final response = await http.get(
      Uri.parse('$baseUrl/taches/taches_user'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      final List<Tache> loadedTaches = (data['taches'] as List)
          .map((tacheJson) => Tache.fromJson(tacheJson))
          .toList();

      // Récupérer les projets associés
      final projectIds = loadedTaches.map((t) => t.projetId).toSet().toList();
      await _fetchProjects(projectIds);

      setState(() {
        taches = loadedTaches;
      });
    } else {
      throw Exception('Failed to load tasks');
    }
  }

  Future<void> _fetchProjects(List<int> projectIds) async {
    if (projectIds.isEmpty) return;

    final token = await storage.read(key: 'token');
    final List<Projet> loadedProjets = [];

    for (final id in projectIds) {
      final response = await http.get(
        Uri.parse('$baseUrl/projets/$id'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        loadedProjets.add(Projet.fromJson(data['projet']));
      }
    }

    setState(() {
      projets = loadedProjets;
    });
  }

  Future<void> _updateTaskStatus(int taskId, String newStatus) async {
    try {
      final token = await storage.read(key: 'token');
      final response = await http.put(
        Uri.parse('$baseUrl/taches/updateStatut/$taskId'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({'statut': newStatus}),
      );

      if (response.statusCode == 200) {
        setState(() {
          taches = taches.map((tache) {
            if (tache.id == taskId) {
              return Tache(
                id: tache.id,
                titre: tache.titre,
                description: tache.description,
                priorite: tache.priorite,
                statut: newStatus,
                dateDebut: tache.dateDebut,
                dateFin: tache.dateFin,
                projetId: tache.projetId,
                isExpanded: tache.isExpanded,
              );
            }
            return tache;
          }).toList();
        });
      } else {
        throw Exception('Failed to update task status');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur lors de la mise à jour du statut')),
      );
    }
  }

  void _toggleTaskExpansion(int taskId) {
    setState(() {
      taches = taches.map((tache) {
        if (tache.id == taskId) {
          return Tache(
            id: tache.id,
            titre: tache.titre,
            description: tache.description,
            priorite: tache.priorite,
            statut: tache.statut,
            dateDebut: tache.dateDebut,
            dateFin: tache.dateFin,
            projetId: tache.projetId,
            isExpanded: !tache.isExpanded,
          );
        }
        return tache;
      }).toList();
    });
  }

  List<Tache> _getFilteredTasks() {
    final now = DateTime.now();
    return taches.where((tache) {
      final taskDate = DateTime.parse(tache.dateFin);

      if (activeFilter == 'all') return true;
      if (activeFilter == 'today') {
        return taskDate.year == now.year &&
            taskDate.month == now.month &&
            taskDate.day == now.day;
      }
      if (activeFilter == 'week') {
        final oneWeekLater = now.add(Duration(days: 7));
        return taskDate.isAfter(now) && taskDate.isBefore(oneWeekLater);
      }
      if (activeFilter == 'late') {
        return taskDate.isBefore(now) && tache.statut != 'Terminé';
      }
      return tache.statut == activeFilter;
    }).toList();
  }

  Projet? _getProjectForTask(int projectId) {
    try {
      return projets.firstWhere((projet) => projet.id == projectId);
    } catch (e) {
      return null;
    }
  }

  Color _getStatusColor(String statut) {
    switch (statut) {
      case 'À faire':
        return Colors.blue;
      case 'En cours':
        return Colors.orange;
      case 'Terminé':
        return Colors.green;
      case 'En retard':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  Color _getPriorityColor(String priorite) {
    switch (priorite) {
      case 'Basse':
        return Colors.green;
      case 'Normale':
        return Colors.blue;
      case 'Haute':
        return Colors.orange;
      case 'Urgente':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  String _formatDate(String dateStr) {
    final date = DateTime.parse(dateStr);
    return '${date.day}/${date.month}/${date.year}';
  }

  bool _isDateOverdue(String dateStr) {
    final now = DateTime.now();
    final taskDate = DateTime.parse(dateStr);
    return taskDate.isBefore(now);
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(),
              SizedBox(height: 16),
              Text('Chargement de vos tâches...'),
            ],
          ),
        ),
      );
    }

    if (errorMessage != null) {
      return Scaffold(
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.error_outline, color: Colors.red, size: 48),
                SizedBox(height: 16),
                Text(
                  errorMessage!,
                  style: TextStyle(fontSize: 16),
                  textAlign: TextAlign.center,
                ),
                SizedBox(height: 16),
                ElevatedButton(
                  onPressed: _loadUserAndTasks,
                  child: Text('Réessayer'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final filteredTasks = _getFilteredTasks();
    final tasksByProject = <int, List<Tache>>{};

    for (var tache in filteredTasks) {
      if (!tasksByProject.containsKey(tache.projetId)) {
        tasksByProject[tache.projetId] = [];
      }
      tasksByProject[tache.projetId]!.add(tache);
    }

    return Scaffold(
      appBar: AppBar(
        title: Text('Mes Tâches'),
        actions: [
          IconButton(
            icon: Icon(Icons.refresh),
            onPressed: _loadUserAndTasks,
          ),
        ],
      ),
      body: Column(
        children: [
          // Filtres
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: EdgeInsets.all(8),
            child: Row(
              children: [
                _buildFilterChip('Toutes', 'all'),
                _buildFilterChip('Aujourd\'hui', 'today'),
                _buildFilterChip('Cette semaine', 'week'),
                _buildFilterChip('En retard', 'late'),
                _buildFilterChip('À faire', 'À faire'),
                _buildFilterChip('En cours', 'En cours'),
                _buildFilterChip('Terminé', 'Terminé'),
              ],
            ),
          ),

          // Statistiques
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildStatCard('Total', '${taches.length}', Colors.grey),
                _buildStatCard('À faire', '${taches.where((t) => t.statut == 'À faire').length}', Colors.blue),
                _buildStatCard('En cours', '${taches.where((t) => t.statut == 'En cours').length}', Colors.orange),
                _buildStatCard('Terminé', '${taches.where((t) => t.statut == 'Terminé').length}', Colors.green),
              ],
            ),
          ),

          // Liste des tâches
          Expanded(
            child: RefreshIndicator(
              onRefresh: _loadUserAndTasks,
              child: tasksByProject.isEmpty
                  ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.assignment, size: 48, color: Colors.grey),
                    SizedBox(height: 16),
                    Text(
                      activeFilter == 'all'
                          ? "Vous n'avez aucune tâche assignée."
                          : "Aucune tâche ne correspond aux critères.",
                      style: TextStyle(color: Colors.grey),
                    ),
                  ],
                ),
              )
                  : ListView.builder(
                itemCount: tasksByProject.length,
                itemBuilder: (context, index) {
                  final projectId = tasksByProject.keys.elementAt(index);
                  final projectTasks = tasksByProject[projectId]!;
                  final projet = _getProjectForTask(projectId);

                  return Card(
                    margin: EdgeInsets.all(8),
                    child: Column(
                      children: [
                        ListTile(
                          title: Text(
                            projet?.titre ?? 'Projet inconnu',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ),
                        ...projectTasks.map((tache) => _buildTaskItem(tache)),
                      ],
                    ),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String filter) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4.0),
      child: FilterChip(
        label: Text(label),
        selected: activeFilter == filter,
        onSelected: (_) => setState(() => activeFilter = filter),
      ),
    );
  }

  Widget _buildStatCard(String title, String value, Color color) {
    return Card(
      margin: EdgeInsets.all(8),
      color: color.withOpacity(0.1),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: TextStyle(color: Colors.grey)),
            SizedBox(height: 4),
            Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
          ],
        ),
      ),
    );
  }

  Widget _buildTaskItem(Tache tache) {
    return ExpansionTile(
      title: Row(
        children: [
          Expanded(
            child: Text(
              tache.titre,
              style: TextStyle(fontWeight: FontWeight.w500),
            ),
          ),
          Chip(
            label: Text(tache.priorite),
            backgroundColor: _getPriorityColor(tache.priorite).withOpacity(0.2),
            labelStyle: TextStyle(color: _getPriorityColor(tache.priorite)),
          ),
          if (_isDateOverdue(tache.dateFin) && tache.statut != 'Terminé')
            Padding(
              padding: EdgeInsets.only(left: 4),
              child: Chip(
                label: Text('En retard'),
                backgroundColor: Colors.red.withOpacity(0.2),
                labelStyle: TextStyle(color: Colors.red),
              ),
            ),
        ],
      ),
      subtitle: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(height: 4),
          Row(
            children: [
              Text('Échéance: ${_formatDate(tache.dateFin)}'),
              SizedBox(width: 8),
              Chip(
                label: Text(tache.statut),
                backgroundColor: _getStatusColor(tache.statut).withOpacity(0.2),
                labelStyle: TextStyle(color: _getStatusColor(tache.statut)),
              ),
            ],
          ),
        ],
      ),
      initiallyExpanded: tache.isExpanded,
      onExpansionChanged: (_) => _toggleTaskExpansion(tache.id),
      children: [
        Padding(
          padding: EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(tache.description),
              SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Début: ${_formatDate(tache.dateDebut)}'),
                  Text('Fin: ${_formatDate(tache.dateFin)}'),
                ],
              ),
              SizedBox(height: 16),
              // Ici vous pourriez ajouter les pièces jointes
              // TaskAttachmentsWidget(tache: tache),
              SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  if (tache.statut != 'En cours')
                    TextButton(
                      style: TextButton.styleFrom(
                        backgroundColor: Colors.orange.withOpacity(0.2),
                      ),
                      onPressed: () => _updateTaskStatus(tache.id, 'En cours'),
                      child: Text('Commencer', style: TextStyle(color: Colors.orange)),
                    ),
                  SizedBox(width: 8),
                  if (tache.statut != 'Terminé')
                    TextButton(
                      style: TextButton.styleFrom(
                        backgroundColor: Colors.green.withOpacity(0.2),
                      ),
                      onPressed: () => _updateTaskStatus(tache.id, 'Terminé'),
                      child: Text('Terminer', style: TextStyle(color: Colors.green)),
                    ),
                  if (tache.statut == 'Terminé')
                    TextButton(
                      style: TextButton.styleFrom(
                        backgroundColor: Colors.blue.withOpacity(0.2),
                      ),
                      onPressed: () => _updateTaskStatus(tache.id, 'À faire'),
                      child: Text('Rouvrir', style: TextStyle(color: Colors.blue)),
                    ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}