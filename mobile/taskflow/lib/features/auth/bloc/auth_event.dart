import 'package:equatable/equatable.dart';

abstract class AuthEvent extends Equatable {
  const AuthEvent();
}

class LoginRequested extends AuthEvent {
  final String email;
  final String password;

  const LoginRequested(this.email, this.password);

  @override
  List<Object> get props => [email, password];
}


class RegisterRequested extends AuthEvent {
  final String nom_complet;
  final String email;
  final String password;

  const RegisterRequested(this.nom_complet, this.email, this.password);

  @override
  List<Object> get props => [nom_complet, email, password];
}

class LogoutRequested extends AuthEvent {}

class CheckAuthStatus extends AuthEvent {}
