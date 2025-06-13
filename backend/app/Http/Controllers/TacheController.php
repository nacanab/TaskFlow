<?php

namespace App\Http\Controllers;

use App\Http\Requests\TacheRequest;
use App\Models\Tache;
use App\Models\Projet;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Models\Notification;

class TacheController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json([
            'taches'=>Tache::all()
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
    public function store(TacheRequest $request)
    {
       try{
            /**
             * @var \App\Models\User $user
             */
            $user = Auth::user();
            $data = $request->validate([
                'titre' => 'required|string',
                'description' => 'nullable|string',
                'priorite' => 'required|string',
                'date_debut' => 'required|date',
                'date_fin' => 'required|date',
                'statut' => 'required|string',
                'tag_id' => 'nullable|exists:tags,id',
                'projet_id' => 'required|exists:projets,id',
                'user_id' => 'nullable|exists:users,id',
                'jalon_id' => 'nullable|exists:jalons,id',
            ]);
            $data['creator_id'] = $user->id;
            $tache=Tache::create($data);
            if($request->user_id){
                $projet = Projet::findOrFail($request->projet_id);
                Notification::create([
                    'user_id'=> $request->user_id,
                    'tache_id'=>$tache->id,
                    'contenu'=> 'La tâche '.$tache->titre.' du projet '.$projet->titre.' vous a été assignée.'
                ]);
            }
            return response()->json([
                'message'=>'Tâche ajoutée avec succès.',
                'error'=>false,
                'success'=>true
            ]);

       }catch(Exception $e){
        return response()->json([
            'message'=>'Erreur d\'enregistrement.',
            'error'=>true,
            'success'=>false
        ]);
       }
    }

    /**
     * Display the specified resource.
     */
    public function show(Tache $tache)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Tache $tache)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(TacheRequest $request, Tache $tache)
    {
        try{
            $data = $request->validate([
                'titre' => 'required|string',
                'description' => 'nullable|string',
                'priorite' => 'required|string',
                'date_debut' => 'required|date',
                'date_fin' => 'required|date',
                'statut' => 'required|string',
                'tag_id' => 'nullable|exists:tags,id',
                'projet_id' => 'required|exists:projets,id',
                'user_id' => 'nullable|exists:users,id',
                'jalon_id' => 'nullable|exists:jalons,id',
            ]);
            $tache=Tache::findOrFail($tache->id);
            $tache->update($data);
            if($request->user_id){
                $projet = Projet::findOrFail($request->projet_id);
                Notification::create([
                    'user_id'=> $request->user_id,
                    'tache_id'=>$tache->id,
                    'contenu'=> 'La tâche '.$tache->titre.' du projet '.$projet->titre.' vous a été assignée.'
                ]);
            }
            return response()->json([
                'message'=>'Tâche modifiée avec succès.',
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

    public function updateStatut(Request $request, Tache $tache)
    {
        try{
            $data = $request->validate([
                'statut' => 'required|string',
            ]);
            $tache=Tache::findOrFail($tache->id);
            $tache->update($data);
            return response()->json([
                'message'=>'Statut modifié avec succès.',
                'error'=>false,
                'success'=>true
            ]);
        }catch(Exception $e){
            return response()->json([
                'message'=>'Erreur de modification.',
                'error'=>true,
                'success'=>false,
                'details'=>$e->getMessage()
            ]);
        }
    }
    public function get_taches_user(){
        /**
         * @var \App\Models\User $user
         */
        $user = Auth::user();
        return response()->json([
            'taches'=>Tache::where('user_id', $user->id)->get()
        ]);
    }
    
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tache $tache)
    {
        try{
            $tache->delete();
            return response()->json([
                'message'=>'Tâche supprimée avec succès.',
                'error'=>false,
                'success'=>true
            ]);
        }catch(Exception $e){
            return response()->json([
                'message'=>'Erreur de suppression.',
                'error'=>true,
                'success'=>false
            ]);
        }
    }
}
