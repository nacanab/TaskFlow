<?php

namespace App\Http\Controllers;

use App\Helpers\Role;
use App\Models\Equipe;
use Illuminate\Http\Request;

class EquipeUsersController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($equipe_id)
    {
        $equipe = Equipe::with('users')->findOrFail($equipe_id);
        return response()->json([
            'users'=>$equipe->users
        ]);
    }

    public function store(Request $request, $equipe_id){
        $request->validate([
            'users' => 'required|array',
            'users.*' => 'exists:users,id',
            'role' => 'nullable|string'
        ]);
    
        $equipe = Equipe::findOrFail($equipe_id);
        $role = $request->input('role', Role::MEMBRE);
    
        $data = [];
        foreach ($request->users as $user_id) {
            $data[$user_id] = ['role' => $role];
        }
    
        $equipe->users()->syncWithoutDetaching($data);
    
        return response()->json(
            [
                'message' => 'Utilisateurs ajoutés avec succès'
            ]);
    }

    public function get_equipes_user($user_id){
        $user = \App\Models\User::with('equipes')->findOrFail($user_id);
        return response()->json([
            'equipes'=>$user->equipes
        ],200);
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'equipe_id' => 'required|exists:equipes,id',
        ]);
    
        $equipe = Equipe::findOrFail($request->equipe_id);
        $equipe->users()->detach($request->user_id);
    
        return response()->json(
            [
                'message' => 'Utilisateur sretiré de l\'équipe'
            ]);
    }
}
