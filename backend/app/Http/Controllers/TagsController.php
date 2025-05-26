<?php

namespace App\Http\Controllers;

use App\Http\Requests\TagsRequest;
use App\Models\Tags;
use Exception;

class TagsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try{
            return response()->json([
                'tags'=>Tags::all()
            ]);
        }catch(Exception $e){
            return response()->json([
                'message'=>'Erreur de récuperation des tags',
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
    public function store(TagsRequest $request)
    {
        try{
            $data = $request->validated();
            Tags::create($data);
            return response()->json([
                'message'=>'Tags créée avec succès.',
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
    public function show(Tags $tags)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Tags $tags)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(TagsRequest $request, Tags $tags)
    {
        try{
            $data = $request->validated();
            $tags = Tags::find($tags->id);
            $tags->update($data);
            return response()->json([
                'message'=>'Tags modifiée avec succès.',
                'error'=>false,
                'success'=>true
            ]);
        }catch(Exception $e){
            return response()->json([
                'message'=>'Erreur de modication',
                'error'=>true,
                'success'=>false
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tags $tags)
    {
        try{
            $tags->delete();
            return response()->json([
                'message'=>'Tags supprimé avec succès.',
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
