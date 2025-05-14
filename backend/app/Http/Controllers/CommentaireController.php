<?php

namespace App\Http\Controllers;

use App\Http\Requests\CommentaireRequest;
use App\Models\Commentaire;
use Exception;

class CommentaireController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json([
            'commentaires'=> Commentaire::all()
        ]);
    }

    public function get_commentaire_tache($tache_id){
        return response()->json(([
            'commentaires'=>Commentaire::where('tache_id', $tache_id)
        ]));
    }

    public function get_users_commentaires($user_id){
        return response()->json([
            'commentaires'=>Commentaire::where('user_id', $user_id)
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CommentaireRequest $request)
    {
        try{
            $data = $request->validated();
            Commentaire::create($data);
            return response()->json([
                'message'=>'Commentaire enregistré avec succès',
                'error'=>false,
                'success'=>true
            ]);
        }catch(Exception $e){
            return response()->json([
                'message'=>'Erreur d\'enregistrement',
                'error'=>true,
                'success'=>false
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Commentaire $commentaire)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Commentaire $commentaire)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CommentaireRequest $request, Commentaire $commentaire)
    {
       try{
            $data = $request->validated();
            $commentaire = Commentaire::find($commentaire->id);
            $commentaire->update($data);
            return response()->json([
                'message'=>'Commentaire modifié avec succès',
                'error'=>false,
                'success'=>true
            ]);
       }catch(Exception $e){
        return response()->json([
            'message'=>'Erreur de modification',
            'error'=>true,
            'success'=>false
        ]);
       }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Commentaire $commentaire)
    {
        try{
            $commentaire->delete();
            return response()->json([
                'message'=>'Commentaire supprimé avec succès',
                'error'=>false,
                'success'=>true
            ]);
        }catch(Exception $e){
            return response()->json([
                'error'=>true,
                'success'=>false,
                'details'=>$e->getMessage()
            ]);
        }
    }
}
