<?php

namespace App\Http\Controllers;

use App\Models\PieceJointe;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Tache;

class PieceJointeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($id)
    {
        //taches pieces jointes
        $pieces = PieceJointe::where('tache_id', $id)->get();
        return response()->json([
            'pieces_jointes' => $pieces
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
    public function store(Request $request, Tache $tache)
    {
        try{
            $request->validate([
                'fichiers' => 'required|array',
                'fichiers.*' => 'required|file',
            ]);
        
            $pieces = [];
            foreach ($request->file('fichiers') as $fichier) {
                
                $originalName = $fichier->getClientOriginalName();
                $path = $fichier->storeAs('pieces_jointes', $originalName, 'public');
        
                $pieces[] = PieceJointe::create([
                    'fichier_url' => $path,
                    'description'=> '',
                    'tache_id' => $tache->id,
                ]);
            }
        
            return response()->json(
                [
                    'pieces_jointes'=>$pieces
                    ]);
        }catch(Exception $e){
            return response()->json([
                'message'=>'Erreur d-enregistrement.',
                'error'=>true,
                'success'=>false,
                'details'=>$e->getMessage()
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(PieceJointe $pieceJointe)
    {
        //
    }

    public function download($id)
{
    $piece = PieceJointe::findOrFail($id);
    $filePath = public_path('storage/' . $piece->fichier_url);

    if (!file_exists($filePath)) {
        abort(404, 'Fichier non trouvé.');
    }

    return response()->download($filePath, basename($filePath));
}

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PieceJointe $pieceJointe)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PieceJointe $pieceJointe)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PieceJointe $pieceJointe)
    {
        try{
            if (Storage::disk('public')->exists($pieceJointe->fichier_url)) {
                Storage::disk('public')->delete($pieceJointe->fichier_url);
            }
        
            $pieceJointe->delete();
        
            return response()->json(
                ['message' => 'Pièce jointe supprimée']
            );
        }catch(Exception $e){
            return response()->json([
                'message'=>'Erreur de suppression',
                'error'=>true,
                'success'=>false
            ]);
        }
    }
}
