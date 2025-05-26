<?php

namespace App\Http\Controllers;

use App\Http\Requests\RapportRequest;
use App\Models\Rapport;
use Exception;

class RapportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json([
            'rapports'=> Rapport::all()
        ]);
    }

    public function get_rapports_tache($tache_id){
        return response()->json([
            'rapports'=> Rapport::where('tache_id', $tache_id)
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
    public function store(RapportRequest $request)
    {
        try{
            $data = $request->validated();
            Rapport::create($data);
            return response()->json([
                'message'=>'Rapport créée avec succès.',
                'error'=>false,
                'success'=>true
            ]);
        }catch(Exception $e){
            return response()->json([
                'message'=>'Errer d\'enregistrement du rapport',
                'error'=>true,
                'success'=>false,
                'details'=>$e->getMessage()
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Rapport $rapport)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Rapport $rapport)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(RapportRequest $request, Rapport $rapport)
    {
        try{
            $data = $request->validated();
            $rapport = Rapport::find($rapport->id);
            $rapport->update($data);
        }catch(Exception $e){
            return response()->json([
                'message'=>'Erreur de modification',
                'error'=>true,
                'success'=>false,
                'details'=>$e->getMessage()
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Rapport $rapport)
    {
        try{
            $rapport->delete();
            return response()->json([
                'message'=>'Rapport supprimé avec succès',
                'error'=>false,
                'succes'=>true
            ]);
        }catch(Exception $e){
            return response()->json([
                'message'=>'Erreur de suppression',
                'error'=>true,
                'success'=>false,
                'details'=>$e->getMessage()
            ]);
        }
    }
}
