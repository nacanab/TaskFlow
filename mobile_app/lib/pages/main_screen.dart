import 'package:flutter/material.dart';
import 'package:mobile_app/pages/project_screen.dart';
import 'profile_screen.dart';
import 'team_screen.dart';
import 'project_screen.dart';
import 'tache_screen.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;

  final List<Widget> _screens = const [
    ProfileScreen(), TeamsPage(), ProjectPage(), TasksPage()
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        selectedItemColor: Colors.blue,
        unselectedItemColor: Colors.grey,
        onTap: _onItemTapped,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profil'),
          BottomNavigationBarItem(icon: Icon(Icons.group), label: 'Équipes'),
          BottomNavigationBarItem(icon: Icon(Icons.work), label: 'Projets'),
          BottomNavigationBarItem(icon: Icon(Icons.task), label: 'Tâches'),
          BottomNavigationBarItem(icon: Icon(Icons.calendar_today), label: 'Calendrier'),
        ],
      ),
    );
  }
}
