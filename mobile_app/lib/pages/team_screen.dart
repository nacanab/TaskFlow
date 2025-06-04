import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

// Modèles
class Team {
  final int id;
  final String name;
  final String description;
  late final List<User> members;
  final int creatorId;

  Team({
    required this.id,
    required this.name,
    required this.description,
    required this.creatorId,
  });

  factory Team.fromJson(Map<String, dynamic> json) {
    List<User> membersList = [];
    if (json['members'] != null) {
      membersList = List<User>.from(
          json['members'].map((member) => User.fromJson(member)));
    }

    return Team(
      id: json['id'],
      name: json['libelle'],
      description: json['description'] ?? '',
      creatorId: json['user_id'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'members': members.map((member) => member.toJson()).toList(),
      'creatorId': creatorId,
    };
  }
}

class User {
  final int id;
  final String name;
  final String email;
  final String? avatarUrl;

  User({
    required this.id,
    required this.name,
    required this.email,
    this.avatarUrl,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      name: json['nom_complet'],
      email: json['email'],
      avatarUrl: json['photo_profil'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'avatarUrl': avatarUrl,
    };
  }
}

// Service API
class TeamService {
  final String baseUrl = "http://127.0.0.1:8000/api/v1";
  late String _token;

  Future<void> init() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('token') ?? '';
  }

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $_token',
  };

  Future<List<User>> getTeamMembers(int teamId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/equipes/$teamId'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      List<dynamic> membres = data['users'];
      return membres.map((json) => User.fromJson(json)).toList();
    } else {
      throw Exception('Échec du chargement des membres pour l’équipe $teamId');
    }
  }


  Future<List<Team>> getUserTeams() async {
    await init();
    final response = await http.get(
      Uri.parse('$baseUrl/equipes/equipes_belongs_user'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      final data=jsonDecode(response.body);
      List<dynamic> teamsJson = data['equipes'];
      List<Team> teams = [];

      for (var teamJson in teamsJson) {
        Team team = Team.fromJson(teamJson);
        team.members = await getTeamMembers(team.id);
        teams.add(team);
      }

      return teams;
    } else {
      throw Exception('Échec du chargement des équipes');
    }
  }

  Future<Team> createTeam(String name, String description) async {
    await init();
    final response = await http.post(
      Uri.parse('$baseUrl/equipes/create'),
      headers: _headers,
      body: jsonEncode({
        'libelle': name,
        'description': description,
      }),
    );

    if (response.statusCode == 201) {
      return Team.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Échec de la création de l\'équipe');
    }
  }

  Future<void> addMemberToTeam(int teamId, String email) async {
    await init();
    final response = await http.post(
      Uri.parse('$baseUrl/equipes/$teamId'),
      headers: _headers,
      body: jsonEncode({
        'email': email,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('Échec de l\'ajout du membre');
    }
  }

  Future<void> removeTeamMember(int teamId, int userId) async {
    await init();
    final response = await http.delete(
      Uri.parse('$baseUrl/equipes/detacher'),
      headers: _headers,
      body: jsonEncode({
        'user_id': userId,
        'equipe_id':teamId,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('Échec de la suppression du membre');
    }
  }

  Future<void> deleteTeam(int teamId) async {
    await init();
    final response = await http.delete(
      Uri.parse('$baseUrl/equipes/delete/$teamId'),
      headers: _headers,
    );

    if (response.statusCode != 200) {
      throw Exception('Échec de la suppression de l\'équipe');
    }
  }

  Future<List<User>> searchUsers(String query) async {
    await init();
    final response = await http.get(
      Uri.parse('$baseUrl/users/search?query=$query'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      List<dynamic> usersJson = jsonDecode(response.body);
      return usersJson.map((json) => User.fromJson(json)).toList();
    } else {
      throw Exception('Échec de la recherche d\'utilisateurs');
    }
  }
}

// Page principale pour les équipes
class TeamsPage extends StatefulWidget {
  const TeamsPage({Key? key}) : super(key: key);

  @override
  State<TeamsPage> createState() => _TeamsPageState();
}

class _TeamsPageState extends State<TeamsPage> with SingleTickerProviderStateMixin {
  final TeamService _teamService = TeamService();
  late TabController _tabController;
  List<Team> _myTeams = [];
  bool _isLoading = true;
  int? _currentUserId;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadUserData();
    _loadTeams();
  }

  Future<void> _loadUserData() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    setState(() {
      final data = jsonDecode(prefs.getString('user') ?? '{}');
      _currentUserId = data?['id'];
    });
  }

  Future<void> _loadTeams() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final teams = await _teamService.getUserTeams();
      setState(() {
        _myTeams = teams;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      _showErrorSnackBar('Impossible de charger les équipes: ${e.toString()}');
    }
  }

  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
      ),
    );
  }

  void _showSuccessSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.green,
      ),
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mes Équipes'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Mes Équipes'),
            Tab(text: 'Équipes Créées'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
        controller: _tabController,
        children: [
          // Tab 1: Toutes mes équipes
          _buildTeamsList(_myTeams, false),
          // Tab 2: Équipes dont je suis créateur
          _buildTeamsList(
            _myTeams.where((team) => team.creatorId == _currentUserId).toList(),
            true,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showCreateTeamDialog,
        child: const Icon(Icons.add),
        tooltip: 'Créer une équipe',
      ),
    );
  }

  Widget _buildTeamsList(List<Team> teams, bool showManageOptions) {
    if (teams.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.group_off,
              size: 64,
              color: Colors.grey,
            ),
            const SizedBox(height: 16),
            Text(
              showManageOptions
                  ? 'Vous n\'avez pas encore créé d\'équipes'
                  : 'Vous ne faites partie d\'aucune équipe',
              style: const TextStyle(fontSize: 18, color: Colors.grey),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            if (showManageOptions)
              ElevatedButton.icon(
                onPressed: _showCreateTeamDialog,
                icon: const Icon(Icons.add),
                label: const Text('Créer une équipe'),
              ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadTeams,
      child: ListView.builder(
        padding: const EdgeInsets.all(8),
        itemCount: teams.length,
        itemBuilder: (context, index) {
          final team = teams[index];
          return _buildTeamCard(team, showManageOptions);
        },
      ),
    );
  }

  Widget _buildTeamCard(Team team, bool showManageOptions) {
    bool isCreator = team.creatorId == _currentUserId;

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
      elevation: 3,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ListTile(
            title: Text(
              team.name,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
            subtitle: Text(team.description),
            trailing: isCreator
                ? IconButton(
              icon: const Icon(Icons.delete_outline),
              tooltip: 'Supprimer l\'équipe',
              onPressed: () => _confirmDeleteTeam(team),
            )
                : null,
            onTap: () => _showTeamDetails(team, showManageOptions),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                const Icon(Icons.group, size: 16, color: Colors.grey),
                const SizedBox(width: 8),
                Text('${team.members.length} membres'),
                const Spacer(),
                if (isCreator)
                  TextButton.icon(
                    icon: const Icon(Icons.person_add, size: 16),
                    label: const Text('Ajouter'),
                    onPressed: () => _showAddMemberDialog(team),
                  ),
              ],
            ),
          ),
          if (team.members.isNotEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: team.members
                      .take(5) // Limite à 5 membres affichés
                      .map((member) => Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: Tooltip(
                      message: member.name,
                      child: CircleAvatar(
                        radius: 16,
                        backgroundImage: member.avatarUrl != null
                            ? NetworkImage(member.avatarUrl!)
                            : null,
                        child: member.avatarUrl == null
                            ? Text(member.name.isNotEmpty
                            ? member.name[0].toUpperCase()
                            : '?')
                            : null,
                      ),
                    ),
                  ))
                      .toList(),
                ),
              ),
            ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }

  void _showCreateTeamDialog() {
    final nameController = TextEditingController();
    final descriptionController = TextEditingController();
    final formKey = GlobalKey<FormState>();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Créer une nouvelle équipe'),
        content: Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: nameController,
                decoration: const InputDecoration(
                  labelText: 'Nom de l\'équipe',
                  hintText: 'Ex: Équipe Marketing',
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Veuillez entrer un nom d\'équipe';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: descriptionController,
                decoration: const InputDecoration(
                  labelText: 'Description',
                  hintText: 'Ex: Équipe responsable des campagnes marketing',
                ),
                maxLines: 3,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('ANNULER'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (formKey.currentState?.validate() ?? false) {
                Navigator.of(context).pop();

                try {
                  await _teamService.createTeam(
                    nameController.text.trim(),
                    descriptionController.text.trim(),
                  );
                  _showSuccessSnackBar('Équipe créée avec succès');
                  _loadTeams(); // Recharger les équipes
                } catch (e) {
                  _showErrorSnackBar('Erreur lors de la création de l\'équipe');
                }
              }
            },
            child: const Text('CRÉER'),
          ),
        ],
      ),
    );
  }

  void _showTeamDetails(Team team, bool showManageOptions) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) {
        return DraggableScrollableSheet(
          initialChildSize: 0.6,
          minChildSize: 0.3,
          maxChildSize: 0.8,
          expand: false,
          builder: (context, scrollController) {
            return TeamDetailsView(
              team: team,
              scrollController: scrollController,
              canManage: showManageOptions && team.creatorId == _currentUserId,
              onAddMember: () {
                Navigator.pop(context);
                _showAddMemberDialog(team);
              },
              onRemoveMember: (userId) async {
                try {
                  await _teamService.removeTeamMember(team.id, userId);
                  _showSuccessSnackBar('Membre retiré avec succès');
                  _loadTeams();
                } catch (e) {
                  _showErrorSnackBar('Erreur lors du retrait du membre');
                }
              },
            );
          },
        );
      },
    );
  }

  void _showAddMemberDialog(Team team) {
    final emailController = TextEditingController();
    final formKey = GlobalKey<FormState>();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Ajouter un membre à ${team.name}'),
        content: Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: emailController,
                decoration: const InputDecoration(
                  labelText: 'Email',
                  hintText: 'Entrez l\'email du nouveau membre',
                ),
                keyboardType: TextInputType.emailAddress,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Veuillez entrer un email';
                  }
                  if (!value.contains('@')) {
                    return 'Veuillez entrer un email valide';
                  }
                  return null;
                },
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('ANNULER'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (formKey.currentState?.validate() ?? false) {
                Navigator.of(context).pop();

                try {
                  await _teamService.addMemberToTeam(
                    team.id,
                    emailController.text.trim(),
                  );
                  _showSuccessSnackBar('Invitation envoyée avec succès');
                  _loadTeams(); // Recharger les équipes
                } catch (e) {
                  _showErrorSnackBar('Erreur lors de l\'ajout du membre');
                }
              }
            },
            child: const Text('AJOUTER'),
          ),
        ],
      ),
    );
  }

  void _confirmDeleteTeam(Team team) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Supprimer l\'équipe?'),
        content: Text(
          'Êtes-vous sûr de vouloir supprimer l\'équipe "${team.name}"? Cette action est irréversible.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('ANNULER'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.of(context).pop();

              try {
                await _teamService.deleteTeam(team.id);
                _showSuccessSnackBar('L\'équipe a été supprimée');
                _loadTeams(); // Recharger les équipes
              } catch (e) {
                _showErrorSnackBar('Erreur lors de la suppression de l\'équipe');
              }
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('SUPPRIMER'),
          ),
        ],
      ),
    );
  }
}

// Vue détaillée de l'équipe
class TeamDetailsView extends StatelessWidget {
  final Team team;
  final ScrollController scrollController;
  final bool canManage;
  final VoidCallback onAddMember;
  final Function(int) onRemoveMember;

  const TeamDetailsView({
    Key? key,
    required this.team,
    required this.scrollController,
    required this.canManage,
    required this.onAddMember,
    required this.onRemoveMember,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Column(
        children: [
          // Poignée de glissement
          Container(
            width: 40,
            height: 5,
            margin: const EdgeInsets.symmetric(vertical: 10),
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(5),
            ),
          ),

          // En-tête
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        team.name,
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    if (canManage)
                      TextButton.icon(
                        icon: const Icon(Icons.person_add),
                        label: const Text('Ajouter'),
                        onPressed: onAddMember,
                      ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  team.description,
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey[600],
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    const Icon(Icons.group, size: 16, color: Colors.grey),
                    const SizedBox(width: 8),
                    Text(
                      '${team.members.length} membres',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Liste des membres
          Expanded(
            child: ListView.builder(
              controller: scrollController,
              itemCount: team.members.length,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemBuilder: (context, index) {
                final member = team.members[index];
                return ListTile(
                  leading: CircleAvatar(
                    backgroundImage:
                    member.avatarUrl != null ? NetworkImage(member.avatarUrl!) : null,
                    child: member.avatarUrl == null
                        ? Text(member.name.isNotEmpty ? member.name[0].toUpperCase() : '?')
                        : null,
                  ),
                  title: Text(member.name),
                  subtitle: Text(member.email),
                  trailing: canManage && member.id != team.creatorId
                      ? IconButton(
                    icon: const Icon(Icons.remove_circle_outline),
                    color: Colors.red,
                    tooltip: 'Retirer de l\'équipe',
                    onPressed: () => onRemoveMember(member.id),
                  )
                      : null,
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
