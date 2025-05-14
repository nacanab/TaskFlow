<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProjetRequest;
use App\Models\Projet;
use Exception;
use Illuminate\Support\Facades\Auth;
use App\Models\Equipe;
use App\Models\User;


class ProjetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json([
            'projets'=> Projet::all()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ProjetRequest $request)
    {
        try{
            /**
             * I put this type to force my IDE to recognise methods of users.
             * @var \App\Models\User $user
             */
            $user = Auth::user();
            $data = $request->validated();
            $data['user_id']= $user->id;
            Projet::create($data);
            return response()->json([
                'message'=>'Projet crée avec succès.'
            ]);
        }catch(Exception $e){
            return response()->json([
                'message'=>'Erreur d\'enregistrement',
                'details'=> $e->getMessage(),
                'error'=>true,
                'success'=>false
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Projet $projet)
    {
        //
    }

    public function get_projets_user(){
        $user = Auth::user();
        return response()->json([
            'projets'=>Projet::where('user_id', $user->id)->get()
        ]);
    }
    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Projet $projet)
    {
        //
    }

    public function get_projet($projet_id){
        return response()->json([
            'projet'=>Projet::findOrFail($projet_id)
        ]);
    }
    /**
     * Update the specified resource in storage.
     */

     public function user_in_projets()
     {
         $user = Auth::user();
         $projets = Projet::all();
         $user_projets = [];
     
         foreach ($projets as $projet) {
             $equipe = Equipe::with('users')->findOrFail($projet->equipe_id);
     
             // Vérifie si l'équipe existe et contient l'utilisateur
             if ($equipe && $equipe->users->contains($user)) {
                 $user_projets[] = $projet;
             }
         }
     
         return response()->json([
             'projets' => $user_projets,
         ]);
     }
     
    
    public function update(ProjetRequest $request, Projet $projet)
    {
        try{
            $data = $request->validated();
            $user = Auth::user();
            $data['user_id']= $user->id;
            $projet = Projet::find($projet->id);
            $projet->update($data);
            return response()->json([
                'message'=>'Projet modifié avec succès.',
                'error'=>false,
                'success'=>true
            ]);

        }catch(Exception $e){
            return response()->json([
                'message'=>'Erreur de modification.',
                'error'=>true,
                'success'=>false
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Projet $projet)
    {
        try{
            $projet->delete();
            return response()->json([
                'message'=>'Projet supprimé avec succès.'
            ]);
        }catch(Exception $e){
            return response()->json([
                'message'=>'Erreur de suppression',
                'error'=>true,
                'success'=>false
            ]);
        }
    }
}
