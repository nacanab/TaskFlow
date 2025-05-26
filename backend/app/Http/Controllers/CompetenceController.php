<?php

namespace App\Http\Controllers;

use App\Models\Competence;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CompetenceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if(!$user){
            return response()->json([
                'message'=>'L\'utilisateur doit être connecté',
                'error'=>true,
                'success'=>false
            ]);
        }
        $competences = $user->competences()->get();
        return response()->json([
            'competences'=>$competences
        ],200);
    }

    public function getAll()
    {
        /** @var *\App\Models\User $user */
        $user = Auth::user();
        if(!$user){
            return response()->json([
                'message'=>'L\'utilisateur doit être connecté',
                'error'=>true,
                'success'=>false
            ]);
        }
        $competences = Competence::all();
        return response()->json([
            'competences'=>$competences
        ],200);
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
     * I use a transaction because I must do multiple insertions.
     */
    public function store(Request $request)
    {
        DB::beginTransaction();
        try{
            /**
             * I put this type to force my IDE to recognise methods of users.
             * @var \App\Models\User $user
             */
            $user = Auth::user();
            if($user){
                $request->validate([
                    'competences' => 'required|array|min:1',
                    'competences.*' => 'string|max:255'
                ]);
                foreach($request->competences as $competence){
                    $competence = Competence::firstOrCreate(['libelle'=>$competence]);
                    $user->competences()->syncWithoutDetaching($competence->id);  
                }
            }
            DB::commit();
            return response()->json([
                'message'=>'Enregistrement effectué avec succès.',
                'error'=>false,
                'success'=>true
            ]);
            
        }catch(Exception $e){
            DB::rollBack();
            return response()->json([
                'message'=>'Erreur d\'enregistrement',
                'error'=>true,
                'success'=>false
            ]);
        }
    }

    public function addCompetenceTask(Request $request, $task_id){
        try{
                $tache=Tache::findOrFail($task_id);
                $request->validate([
                    'competences' => 'required|array|min:1',
                    'competences.*' => 'string|max:255'
                ]);
                foreach($request->competences as $competence){
                    $competence = Competence::firstOrCreate(['libelle'=>$competence]);
                    $tache->competences()->syncWithoutDetaching($competence->id);  
                }
            return response()->json([
                'message'=>'Enregistrement effectué avec succès.',
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

    public function getCompetencesTask($task_id){
        try{
            $tache=Tache::findOrFail($task_id);
            $competences = $tache->competences()->get();
            return response()->json([
                'competences'=>$competences
            ],200);
        }catch(Exception $e){
            return response()->json([
                'message'=>'Erreur de récupération des compétences',
                'error'=>true,
                'success'=>false
            ]);
        }
    }

    public function deleteCompetenceTask($task_id, $competence_id){
        try{
            $tache=Tache::findOrFail($task_id);
            $competence=Competence::findOrFail($competence_id);
            $tache->competences()->detach($competence);
            return response()->json([
                'message'=>'Compétence supprimée avec succès',
                'error'=>false,
                'success'=>true
            ]);
        }catch(Exception $e){
            return response()->json([
                'message'=>'Erreur de suppression',
                'error'=>true,
                'success'=>false
            ]);
        }
    }


    /**
     * Display the specified resource.
     */
    public function show(Competence $competence)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Competence $competence)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {
        try{
            /**
             * @var User $user
             */
            $user = Auth::user();
            $request->validate([
                'competences' => 'required|array',
                'competences.*' => 'string|max:255'
            ]);
            $newCompetences = [];
            foreach ($request->competences as $libelle) {
                $competence = Competence::firstOrCreate(['libelle' => trim($libelle)]);
                $newCompetences[] = $competence->id;
            }
            $user->competences()->sync($newCompetences);

            // 5. Réponse
            return response()->json([
                'success' => true,
                'message' => 'Compétences mises à jour',
                'competences' => $request->competences
            ]);
        }catch(Exception $e){
            return response()->json([
                'message'=>'Erreur de modidication',
                'error'=>true,
                'success'=>false
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Competence $competence)
    {
        try{
            /**
             * @var \App\Models\User $user
             */
            $user = Auth::user();
            $competence = Competence::findOrFail($competence->id);
            $user->competences()->detach($competence);

            return response()->json([
                 'message' => 'Cette compétence a été supprimée.'
            ]);
        }catch(Exception $e){
            return response()->json([
                'message'=>'Erreur de suppression',
                'error'=>true,
                'success'=>false
            ]);
        }
    }

    public function destroyAll(){
        try{
            /**
             * @var \App\Models\User $user
             */
            $user = Auth::user();
            $user->competences()->detach();

            return response()->json([
                 'message' => 'Toutes les compétences ont été supprimées'
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
