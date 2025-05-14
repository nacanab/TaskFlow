import 'package:flutter/material.dart';
import 'package:taskflow/core/theme/app_theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:taskflow/core/network/api_client.dart';
import 'package:taskflow/features/auth/bloc/auth_bloc.dart';
import 'package:taskflow/features/auth/repository/auth_repository.dart';
import 'package:taskflow/features/auth/screens/login_screen.dart';
import 'package:taskflow/features/auth/screens/register_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
        providers: [
          RepositoryProvider(create: (_) => ApiClient()),
          RepositoryProvider(
            create: (context) => AuthRepository(
              apiClient: context.read<ApiClient>(),
            ),
          ),
        ],
        child: MultiBlocProvider(
            providers: [
            BlocProvider(
            create: (context) => AuthBloc(
    authRepository: context.read<AuthRepository>(),
    ))],
    child: MaterialApp(
    title: 'TaskFlow',
    theme: AppTheme.lightTheme,
    initialRoute: '/login',
    routes: {
    '/login': (context) => const LoginScreen(),
    '/register': (context) => const RegisterScreen(),
    },
    debugShowCheckedModeBanner: false,
    ),
    ),
    );
  }
}
