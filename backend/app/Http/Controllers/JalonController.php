<?php

namespace App\Http\Controllers;

use App\Http\Requests\JalonRequest;
use App\Models\Jalon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class JalonController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json([
            'jalons'=> Jalon::all()
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
    public function store(JalonRequest $request)
    {

        try{
            /**
             * @var \App\Models\User $user
             */
            $user = Auth::user();
            $data = $request->validate([
                'libelle' => 'required|string',
                'description' => 'nullable|string',
                'projet_id' => 'required|exists:projets,id',
                'statut' => 'required|string',
            ]);
            $data['user_id'] = $user->id;
            Jalon::create($data);
            return response()->json([
                'message'=>'Jalon créée avec succès.',
                'error'=>false,
                'success'=>true
            ]);

        }catch(Exception $e){
            return response()->json([
                'message'=>'Erreur d\'enregistrement',
                'error'=>true,
                'success'=>false,
                'details'=>$e->getMessage()
            ]);
        }
    }

    public function get_project_jalons($projet_id){
        $jalons = Jalon::where('projet_id', $projet_id)->get();
        return response()->json([
            'jalons'=>$jalons
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Jalon $jalon)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Jalon $jalon)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(JalonRequest $request, Jalon $jalon)
    {
        try{
            $data = $request->validate([
                'libelle' => 'required|string',
                'description' => 'nullable|string',
                'projet_id' => 'required|exists:projets,id',
                'statut' => 'required|string',
            ]);
            $jalon = Jalon::find($jalon->id);
            $jalon->update($data);
            return response()->json([
                'message'=>'Jalon mis à jour avec succès.',
                'error'=>false,
                'success'=>true
            ]);
        }catch(Exception $e){
            return response()->json([
                'message'=>'Erreur de modification',
                'error'=>true,
                'success'=>false,
                'details'=>$e->getMessage()
            ]);
        }
    }

    public function get_jalons_user(){
        $user = Auth::user();
        return response()->json([
            'jalons'=>Jalon::where('user_id', $user->id)->get()
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Jalon $jalon)
    {
        try{
            $jalon->delete();
            return response()->json([
                'message'=>'Jalon supprime avec succes.',
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
}
