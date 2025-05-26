<?php

namespace App\Http\Controllers;

use App\Http\Requests\EquipeRequest;
use App\Models\Equipe;
use Exception;
use Illuminate\Support\Facades\Auth ;
use App\Models\User;
use App\Helpers\Role;

class EquipeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try{
            $equipes = Equipe::all();
            return response()->json([
                'equipes' => $equipes
            ]);
        }catch(Exception $e){
            return response()->json([
                'message'=>'Erreur de récuperation des équipes.',
                'details'=>$e->getMessage(),
                'error'=>true,
                'success'=>false
            ]);
        }
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
    public function store(EquipeRequest $request)
    {
        try{
            /**
             * @var User $user
             */
            $user = Auth::user();
            $data = $request->validated();
            $data['user_id']= $user->id; 
            $equipe = Equipe::create($data);
            $equipe->users()->attach($user->id, ['role' => Role::LEADER]);
            return response()->json([
                'message'=>'Equipe créée avec succès.',
                'error'=>false,
                'success'=>true
            ]);

        }catch(Exception $e){
            return response()->json([
                'message'=>'Erreur d\'enregistrement',
                'details'=>$e->getMessage(),
                'error'=>true,
                'success'=>false

            ]);
        }

    }

    /**
     * Display the specified resource.
     */
    public function show(Equipe $equipe)
    {
        //

    }

    public function get_equipes_user(){
        try{
            /**
             * @var User $user
             */
            $user = Auth::user();
            $equipes = Equipe::where('user_id', $user->id)->get();
            return response()->json([
                'equipes'=>$equipes
            ]);
        }catch(Exception $e){
            return response()->json([
                'message'=>'Erreur de recuperation.',
                'error'=>true,
                'success'=>false
            ]);
        }
    }

    public function get_equipes_belongs_user(){
        /**
         * @var \App\Models\User $user
         */
        $user = Auth::user();
        return response()->json([
            'equipes'=> $user->equipes()->get()
        ],200);
    }
    
    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Equipe $equipe)
    {
        //
    }
    
    public function get_team_creator($equipe_id){
        try{
            $equipe = Equipe::with('user')->findOrFail($equipe_id);
            return response()->json([
                'user'=>$equipe->user
            ]);
        }catch(Exception $e){
            return response()->json([
                'message'=>'Erreur de recuperation.',
                'error'=>true,
                'success'=>false
            ]);
        }
    }
    /**
     * Update the specified resource in storage.
     */
    public function update(EquipeRequest $request, Equipe $equipe)
    {
       try{
            /**
             * @var User $user
             */
            $user = Auth::user();
            $data = $request->validated();
            $data['user_id']= $user->id;
            $equipe = Equipe::findOrFail($equipe->id);
            $equipe->update($data);

            return response()->json([
                'message'=>'Equipe modifiée avec succès.',
                'error'=>false,
                'success'=>true
            ]);

       }catch(Exception $e){
            return response()->json([
                'message'=>'Erreur de modification.',
                'details'=>$e->getMessage(),
                'error'=>true,
                'success'=>false
            ]);
       }

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Equipe $equipe)
    {
        try{
            $equipe= Equipe::findOrFail($equipe->id);
            $equipe->delete();
            return response()->json([
                'message'=>'Equipe supprimée avec succès.',
                'error'=>true,
                'success'=>false
            ]);
        }catch(Exception $e){
            return response()->json([
                'message'=>'Erreur de suppression.',
                'details'=>$e->getMessage(),
                'error'=>true,
                'success'=>false
            ]);
        }
    }
}
