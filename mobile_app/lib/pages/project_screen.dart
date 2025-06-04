import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

// Model classes
class Equipe {
  final int id;
  final String libelle;

  Equipe({required this.id, required this.libelle});

  factory Equipe.fromJson(Map<String, dynamic> json) {
    return Equipe(
      id: json['id'],
      libelle: json['libelle'],
    );
  }
}

class User {
  final int id;
  final String nomComplet;

  User({required this.id, required this.nomComplet});

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      nomComplet: json['nom_complet'],
    );
  }
}

class Projet {
  final int id;
  final String titre;
  final String description;
  final String dateDebut;
  final String dateFin;
  final int equipeId;

  Projet({
    required this.id,
    required this.titre,
    required this.description,
    required this.dateDebut,
    required this.dateFin,
    required this.equipeId,
  });

  factory Projet.fromJson(Map<String, dynamic> json) {
    return Projet(
      id: json['id'],
      titre: json['titre'],
      description: json['description'],
      dateDebut: json['date_debut'],
      dateFin: json['date_fin'],
      equipeId: json['equipe_id'],
    );
  }
}

class Jalon {
  final int id;
  final String libelle;
  final String description;
  final int projetId;
  final String statut;

  Jalon({
    required this.id,
    required this.libelle,
    required this.description,
    required this.projetId,
    required this.statut,
  });

  factory Jalon.fromJson(Map<String, dynamic> json) {
    return Jalon(
      id: json['id'],
      libelle: json['libelle'],
      description: json['description'],
      projetId: json['projet_id'],
      statut: json['statut'],
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
  final int? userId;
  final int? jalonId;
  final List<PieceJointe>? piecesJointes;

  Tache({
    required this.id,
    required this.titre,
    required this.description,
    required this.priorite,
    required this.statut,
    required this.dateDebut,
    required this.dateFin,
    required this.projetId,
    this.userId,
    this.jalonId,
    this.piecesJointes,
  });

  factory Tache.fromJson(Map<String, dynamic> json) {
    return Tache(
      id: json['id'],
      titre: json['titre'],
      description: json['description'],
      priorite: json['priorite'],
      statut: json['statut'],
      dateDebut: json['date_debut'],
      dateFin: json['date_fin'],
      projetId: json['projet_id'],
      userId: json['user_id'],
      jalonId: json['jalon_id'],
      piecesJointes: json['pieces_jointes'] != null
          ? (json['pieces_jointes'] as List)
          .map((pj) => PieceJointe.fromJson(pj))
          .toList()
          : null,
    );
  }
}

class PieceJointe {
  final int id;
  final String type;
  final String url;

  PieceJointe({
    required this.id,
    required this.type,
    required this.url,
  });

  factory PieceJointe.fromJson(Map<String, dynamic> json) {
    return PieceJointe(
      id: json['id'],
      type: json['type'],
      url: json['url'],
    );
  }
}

class ProjectPage extends StatefulWidget {
  const ProjectPage({super.key});
  @override
  _ProjectPageState createState() => _ProjectPageState();
}

class _ProjectPageState extends State<ProjectPage> {
  final String baseURL = 'http://localhost:8000/api/v1';
  int _selectedIndex = 0;
  Projet? selectedProjet;

  // Data lists
  List<Projet> projets = [];
  List<Jalon> jalons = [];
  List<Tache> taches = [];
  List<Equipe> equipes = [];
  List<User> membres = [];

  // Form controllers
  final _projetFormKey = GlobalKey<FormState>();
  final _jalonFormKey = GlobalKey<FormState>();
  final _tacheFormKey = GlobalKey<FormState>();

  TextEditingController titreProjetController = TextEditingController();
  TextEditingController descriptionProjetController = TextEditingController();
  TextEditingController dateDebutProjetController = TextEditingController();
  TextEditingController dateFinProjetController = TextEditingController();
  int? selectedEquipeId;

  TextEditingController libelleJalonController = TextEditingController();
  TextEditingController descriptionJalonController = TextEditingController();
  String selectedStatutJalon = 'A faire';

  TextEditingController titreTacheController = TextEditingController();
  TextEditingController descriptionTacheController = TextEditingController();
  TextEditingController dateDebutTacheController = TextEditingController();
  TextEditingController dateFinTacheController = TextEditingController();
  String selectedPrioriteTache = 'Normale';
  String selectedStatutTache = 'A faire';
  int? selectedUserId;
  int? selectedJalonId;

  bool isEditMode = false;
  int? editId;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    await fetchProjets();
    await fetchEquipes();
    await fetchMembres();
  }

  Future<void> fetchProjets() async {
    try {
      final response = await http.get(
        Uri.parse('$baseURL/projets/'),
        headers: {'Authorization': 'Bearer YOUR_TOKEN'},
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          projets = (data['projets'] as List)
              .map((p) => Projet.fromJson(p))
              .toList();
        });
      }
    } catch (e) {
      print('Error fetching projects: $e');
    }
  }

  Future<void> fetchEquipes() async {
    try {
      final response = await http.get(
        Uri.parse('$baseURL/equipes/equipes_user'),
        headers: {'Authorization': 'Bearer YOUR_TOKEN'},
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          equipes = (data['equipes'] as List)
              .map((e) => Equipe.fromJson(e))
              .toList();
        });
      }
    } catch (e) {
      print('Error fetching teams: $e');
    }
  }

  Future<void> fetchMembres() async {
    try {
      final response = await http.get(
        Uri.parse('$baseURL/users'),
        headers: {'Authorization': 'Bearer YOUR_TOKEN'},
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          membres = (data['users'] as List)
              .map((u) => User.fromJson(u))
              .toList();
        });
      }
    } catch (e) {
      print('Error fetching members: $e');
    }
  }

  Future<void> fetchJalons(int projetId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseURL/jalons/projet_jalons/$projetId'),
        headers: {'Authorization': 'Bearer YOUR_TOKEN'},
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          jalons = (data['jalons'] as List)
              .map((j) => Jalon.fromJson(j))
              .toList();
        });
      }
    } catch (e) {
      print('Error fetching milestones: $e');
    }
  }

  Future<void> fetchTaches(int projetId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseURL/taches?projet_id=$projetId'),
        headers: {'Authorization': 'Bearer YOUR_TOKEN'},
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          taches = (data['taches'] as List)
              .map((t) => Tache.fromJson(t))
              .toList();
        });
      }
    } catch (e) {
      print('Error fetching tasks: $e');
    }
  }

  Future<void> createProjet() async {
    if (_projetFormKey.currentState!.validate()) {
      try {
        final response = await http.post(
          Uri.parse('$baseURL/projets/create'),
          headers: {
            'Authorization': 'Bearer YOUR_TOKEN',
            'Content-Type': 'application/json',
          },
          body: json.encode({
            'titre': titreProjetController.text,
            'description': descriptionProjetController.text,
            'date_debut': dateDebutProjetController.text,
            'date_fin': dateFinProjetController.text,
            'equipe_id': selectedEquipeId,
          }),
        );
        if (response.statusCode == 201) {
          Navigator.pop(context);
          _resetProjetForm();
          fetchProjets();
        }
      } catch (e) {
        print('Error creating project: $e');
      }
    }
  }

  Future<void> updateProjet() async {
    if (_projetFormKey.currentState!.validate()) {
      try {
        final response = await http.put(
          Uri.parse('$baseURL/projets/update/$editId'),
          headers: {
            'Authorization': 'Bearer YOUR_TOKEN',
            'Content-Type': 'application/json',
          },
          body: json.encode({
            'titre': titreProjetController.text,
            'description': descriptionProjetController.text,
            'date_debut': dateDebutProjetController.text,
            'date_fin': dateFinProjetController.text,
            'equipe_id': selectedEquipeId,
          }),
        );
        if (response.statusCode == 200) {
          Navigator.pop(context);
          _resetProjetForm();
          fetchProjets();
        }
      } catch (e) {
        print('Error updating project: $e');
      }
    }
  }

  Future<void> deleteProjet(int id) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseURL/projets/delete/$id'),
        headers: {'Authorization': 'Bearer YOUR_TOKEN'},
      );
      if (response.statusCode == 200) {
        fetchProjets();
        if (selectedProjet != null && selectedProjet!.id == id) {
          setState(() {
            selectedProjet = null;
            _selectedIndex = 0;
          });
        }
      }
    } catch (e) {
      print('Error deleting project: $e');
    }
  }

  // Similar methods for Jalon and Tache CRUD operations would go here...

  void _resetProjetForm() {
    titreProjetController.clear();
    descriptionProjetController.clear();
    dateDebutProjetController.clear();
    dateFinProjetController.clear();
    selectedEquipeId = null;
    isEditMode = false;
    editId = null;
  }

  void _editProjet(Projet projet) {
    setState(() {
      titreProjetController.text = projet.titre;
      descriptionProjetController.text = projet.description;
      dateDebutProjetController.text = projet.dateDebut;
      dateFinProjetController.text = projet.dateFin;
      selectedEquipeId = projet.equipeId;
      isEditMode = true;
      editId = projet.id;
    });
    _showProjetForm();
  }

  void _showProjetForm() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) {
        return SingleChildScrollView(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
          ),
          child: Container(
            padding: EdgeInsets.all(16),
            child: Form(
              key: _projetFormKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    isEditMode ? 'Modifier le Projet' : 'Nouveau Projet',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 16),
                  TextFormField(
                    controller: titreProjetController,
                    decoration: InputDecoration(labelText: 'Titre'),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Veuillez entrer un titre';
                      }
                      return null;
                    },
                  ),
                  SizedBox(height: 16),
                  TextFormField(
                    controller: descriptionProjetController,
                    decoration: InputDecoration(labelText: 'Description'),
                    maxLines: 3,
                  ),
                  SizedBox(height: 16),
                  TextFormField(
                    controller: dateDebutProjetController,
                    decoration: InputDecoration(labelText: 'Date de début'),
                    onTap: () async {
                      final date = await showDatePicker(
                        context: context,
                        initialDate: DateTime.now(),
                        firstDate: DateTime(2000),
                        lastDate: DateTime(2100),
                      );
                      if (date != null) {
                        dateDebutProjetController.text =
                            DateFormat('yyyy-MM-dd').format(date);
                      }
                    },
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Veuillez sélectionner une date';
                      }
                      return null;
                    },
                  ),
                  SizedBox(height: 16),
                  TextFormField(
                    controller: dateFinProjetController,
                    decoration: InputDecoration(labelText: 'Date de fin'),
                    onTap: () async {
                      final date = await showDatePicker(
                        context: context,
                        initialDate: DateTime.now(),
                        firstDate: DateTime(2000),
                        lastDate: DateTime(2100),
                      );
                      if (date != null) {
                        dateFinProjetController.text =
                            DateFormat('yyyy-MM-dd').format(date);
                      }
                    },
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Veuillez sélectionner une date';
                      }
                      return null;
                    },
                  ),
                  SizedBox(height: 16),
                  DropdownButtonFormField<int>(
                    value: selectedEquipeId,
                    decoration: InputDecoration(labelText: 'Équipe'),
                    items: equipes
                        .map((equipe) => DropdownMenuItem<int>(
                      value: equipe.id,
                      child: Text(equipe.libelle),
                    ))
                        .toList(),
                    onChanged: (value) {
                      setState(() {
                        selectedEquipeId = value;
                      });
                    },
                    validator: (value) {
                      if (value == null) {
                        return 'Veuillez sélectionner une équipe';
                      }
                      return null;
                    },
                  ),
                  SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      TextButton(
                        onPressed: () {
                          Navigator.pop(context);
                          _resetProjetForm();
                        },
                        child: Text('Annuler'),
                      ),
                      SizedBox(width: 8),
                      ElevatedButton(
                        onPressed: isEditMode ? updateProjet : createProjet,
                        child: Text(isEditMode ? 'Modifier' : 'Créer'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  void _selectProjet(Projet projet) {
    setState(() {
      selectedProjet = projet;
      _selectedIndex = 1;
    });
    fetchJalons(projet.id);
    fetchTaches(projet.id);
  }

  String _getEquipeLibelle(int equipeId) {
    final equipe = equipes.firstWhere((e) => e.id == equipeId, orElse: () => Equipe(id: -1, libelle: 'Inconnu'));
    return equipe.libelle;
  }

  String _getMembreNom(int? userId) {
    if (userId == null) return 'Non assigné';
    final membre = membres.firstWhere((m) => m.id == userId, orElse: () => User(id: -1, nomComplet: 'Inconnu'));
    return membre.nomComplet;
  }

  String _getJalonLibelle(int? jalonId) {
    if (jalonId == null) return 'Aucun jalon';
    final jalon = jalons.firstWhere((j) => j.id == jalonId, orElse: () => Jalon(id: -1, libelle: 'Inconnu', description: '', projetId: -1, statut: ''));
    return jalon.libelle;
  }

  Color _getStatusColor(String statut) {
    switch (statut) {
      case 'A faire':
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Gestionnaire de Projets'),
      ),
      body: IndexedStack(
        index: _selectedIndex,
        children: [
          // Projects List
          _buildProjectsList(),
          // Project Details
          selectedProjet != null ? _buildProjectDetails() : Center(child: Text('Sélectionnez un projet')),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        items: [
          BottomNavigationBarItem(
            icon: Icon(Icons.list),
            label: 'Projets',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.details),
            label: 'Détails',
          ),
        ],
      ),
      floatingActionButton: _selectedIndex == 0
          ? FloatingActionButton(
        onPressed: () {
          _resetProjetForm();
          _showProjetForm();
        },
        child: Icon(Icons.add),
      )
          : null,
    );
  }

  Widget _buildProjectsList() {
    return ListView.builder(
      itemCount: projets.length,
      itemBuilder: (context, index) {
        final projet = projets[index];
        return Card(
          margin: EdgeInsets.all(8),
          child: InkWell(
            onTap: () => _selectProjet(projet),
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          projet.titre,
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      PopupMenuButton(
                        itemBuilder: (context) => [
                          PopupMenuItem(
                            child: Text('Modifier'),
                            onTap: () => _editProjet(projet),
                          ),
                          PopupMenuItem(
                            child: Text('Supprimer'),
                            onTap: () => deleteProjet(projet.id),
                          ),
                        ],
                      ),
                    ],
                  ),
                  SizedBox(height: 8),
                  Text(
                    projet.description,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(color: Colors.grey),
                  ),
                  SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Équipe: ${_getEquipeLibelle(projet.equipeId)}',
                        style: TextStyle(fontSize: 12),
                      ),
                      Text(
                        '${DateFormat('dd/MM/yyyy').format(DateTime.parse(projet.dateDebut))} - ${DateFormat('dd/MM/yyyy').format(DateTime.parse(projet.dateFin))}',
                        style: TextStyle(fontSize: 12),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildProjectDetails() {
    if (selectedProjet == null) return Container();

    return SingleChildScrollView(
      padding: EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Card(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    selectedProjet!.titre,
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(selectedProjet!.description),
                  SizedBox(height: 16),
                  Wrap(
                    spacing: 16,
                    runSpacing: 8,
                    children: [
                      Text('Équipe: ${_getEquipeLibelle(selectedProjet!.equipeId)}'),
                      Text('Début: ${DateFormat('dd/MM/yyyy').format(DateTime.parse(selectedProjet!.dateDebut))}'),
                      Text('Fin: ${DateFormat('dd/MM/yyyy').format(DateTime.parse(selectedProjet!.dateFin))}'),
                    ],
                  ),
                ],
              ),
            ),
          ),
          SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Jalons',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              IconButton(
                icon: Icon(Icons.add),
                onPressed: () {
                  // Show jalon form
                },
              ),
            ],
          ),
          SizedBox(height: 8),
          _buildJalonsList(),
          SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Tâches',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              IconButton(
                icon: Icon(Icons.add),
                onPressed: () {
                  // Show task form
                },
              ),
            ],
          ),
          SizedBox(height: 8),
          _buildTachesList(),
        ],
      ),
    );
  }

  Widget _buildJalonsList() {
    if (jalons.isEmpty) {
      return Card(
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Center(child: Text('Aucun jalon pour ce projet')),
        ),
      );
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: NeverScrollableScrollPhysics(),
      itemCount: jalons.length,
      itemBuilder: (context, index) {
        final jalon = jalons[index];
        return Card(
          margin: EdgeInsets.only(bottom: 8),
          child: ListTile(
            title: Text(jalon.libelle),
            subtitle: Text(jalon.description),
            trailing: Chip(
              label: Text(jalon.statut),
              backgroundColor: _getStatusColor(jalon.statut).withOpacity(0.2),
              labelStyle: TextStyle(color: _getStatusColor(jalon.statut)),
            ),
            onTap: () {
              // Edit jalon
            },
          ),
        );
      },
    );
  }

  Widget _buildTachesList() {
    if (taches.isEmpty) {
      return Card(
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Center(child: Text('Aucune tâche pour ce projet')),
        ),
      );
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: NeverScrollableScrollPhysics(),
      itemCount: taches.length,
      itemBuilder: (context, index) {
        final tache = taches[index];
        return Card(
          margin: EdgeInsets.only(bottom: 8),
          child: ExpansionTile(
            title: Text(tache.titre),
            subtitle: Text(_getMembreNom(tache.userId)),
            children: [
              Padding(
                padding: EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(tache.description),
                    SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        Chip(
                          label: Text(tache.priorite),
                          backgroundColor: _getPriorityColor(tache.priorite).withOpacity(0.2),
                          labelStyle: TextStyle(color: _getPriorityColor(tache.priorite)),
                        ),
                        Chip(
                          label: Text(tache.statut),
                          backgroundColor: _getStatusColor(tache.statut).withOpacity(0.2),
                          labelStyle: TextStyle(color: _getStatusColor(tache.statut)),
                        ),
                        if (tache.jalonId != null)
                          Chip(
                            label: Text(_getJalonLibelle(tache.jalonId)),
                            backgroundColor: Colors.grey.withOpacity(0.2),
                          ),
                      ],
                    ),
                    SizedBox(height: 8),
                    Text(
                      '${DateFormat('dd/MM/yyyy').format(DateTime.parse(tache.dateDebut))} - ${DateFormat('dd/MM/yyyy').format(DateTime.parse(tache.dateFin))}',
                      style: TextStyle(fontSize: 12),
                    ),
                    if (tache.piecesJointes != null && tache.piecesJointes!.isNotEmpty)
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          SizedBox(height: 8),
                          Text(
                            'Pièces jointes:',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                          Wrap(
                            spacing: 8,
                            children: tache.piecesJointes!
                                .map((pj) => ActionChip(
                              avatar: Icon(Icons.attach_file, size: 18),
                              label: Text(pj.url.split('/').last),
                              onPressed: () {
                                // Download file
                              },
                            ))
                                .toList(),
                          ),
                        ],
                      ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}