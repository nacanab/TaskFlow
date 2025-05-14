<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Support\Facades\Auth;
use Exception;
use Illuminate\Http\Request;
use App\Models\User;

class NotificationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    public function get_by_user(){
        // Récupérer les notifications de l'utilisateur
        /**
             * @var User $user
             */
        $user=Auth::user();
        return response()->json([
            'notifications'=>Notification::where('user_id', $user->id)->get()
        ]);
    }

    public function get_by_tache($tache_id){
        return response()->json([
            'notifications'=>Notification::where('tache_id',$tache_id)->get()
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
    public function store(Request $request)
    {
        try{
            $data = $request->validate([
                'user_id'=>'required|exists:users,id',
                'tache_id'=>'required|exists:taches,id',
                'contenu'=>'required|string'
            ]);
            Notification::create($data);
            
            return response()->json([
                'message'=>'Notification envoyé avec succès.',
                'error'=>false,
                'success'=>true
            ]);
        }catch(Exception $e){
            return response()->json([
                'message'=>'Erreur de creation de la notification',
                'details'=>$e->getMessage(),
                'error'=>true,
                'success'=>false
            ]);
        }
    }

    function mark_as_read($id){
        try{
            $notification = Notification::findOrFail($id);
            $notification->est_lu = true;
            $notification->save();
            return response()->json([
                'message'=>'Notification marquée comme lue avec succès.',
                'error'=>false,
                'success'=>true
            ]);
        }catch(Exception $e){
            return response()->json([
                'message'=>'Erreur de mise à jour de la notification',
                'details'=>$e->getMessage(),
                'error'=>true,
                'success'=>false
            ]);
        }
    }
    /**
     * Display the specified resource.
     */
    public function show(Notification $notification)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Notification $notification)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Notification $notification)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Notification $notification)
    {
        try{
            $notification->delete();
            return response()->json([
                'message'=>'Notification supprime avec succes'
            ]);
        }catch(Exception $e){
            return response()->json([
                'messgae'=>'Erreur de suppression'
            ]);
        }
    }
}