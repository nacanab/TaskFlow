<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginUserRequest;
use App\Http\Requests\RegisterUserRequest;
use App\Models\User;
use Exception;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class UserController extends Controller


{
    /**
     * To create a user account.
     * 
     */

    public function register(RegisterUserRequest $request)
    {
        try{

            $validated = $request->validated();
        
            $photo = null;
            if ($request->hasFile('photo_profil')) {
                $photo = $request->file('photo_profil')->store('PHOTO_PROFILS', 'public');
            }

            $user = User::create([
                'nom_complet' => $validated['nom_complet'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'photo_profil' => $photo,
                'est_admin' => false 
            ]);

            return response()->json([
                'token' => $user->createToken('auth_token')->plainTextToken,
                'token_type' => 'Bearer',
                'user'=>$user->only(['id', 'nom_complet', 'email', 'photo_profil','est_admin','created_at']),
                'message'=>'Compte utilisateur créée avec succès.'
            ], 201);

        }catch(Exception $e){
            if (isset($photo)) {
                Storage::disk('public')->delete($photo);
            }
            return response()->json([
                'error' => 'Erreur de creation du compte.',
                'details' => $e->getMessage(),
            ],500);
        }
        
        
    }

    /**
     * Login user
     
     * @return 
     */
    public function login(LoginUserRequest $request){
        try{
            $credentials=$request->validated();
            if(!Auth::attempt($credentials)){
                ValidationException::withMessages([
                    'email'=>['Informations de connexion incorrectes.']
                ]);
            }
            /** @var  \App\Models\User $user */
            $user = Auth::user();
            $user->tokens()->delete();
    
            $token = $user->createToken('auth_token')->plainTextToken;
    
            return response()->json([
                'user' => $user->only(['id', 'nom_complet', 'email', 'photo_profil','est_admin','created_at']),
                'token' => $token,
                'token_type' => 'Bearer',
                'message' => 'Connexion réussie.',
            ], 200);
        }catch(Exception $e){
            return response()->json([
                'error'=>'Erreur de connexion',
                'details'=>$e->getMessage(),
            ]);
        }
    }

    /**
     * Logout an user
     * @param  $request
     * @return 
     */
    public function logout(Request $request)
    {
        try{
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'success'=>true,
                'error'=>false,
                'message' => 'Vous êtes maintenant déconnecté.'
            ]);
        }catch(Exception $e){
            return response()->json([
                'success'=>false,
                'error'=>true,
                'message' => 'Erreur de connexion.',
                'details'=>$e->getMessage(),
            ]);
        }
        
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::select(['id','nom_complet','email','photo_profil'])->get();
        return response()->json([
            'users'=>$users,
            'success'=>true,
            'error'=>false
        ]);
    }

    /**
     * Get a information of an user
     * @return mixed|\Illuminate\Http\JsonResponse
     */
    public function get_user(){
        $user = Auth::user();
        return response()->json([
            'user'=> User::findOrFail($user->id)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
{
    try {
        $user = User::findOrFail($id);
        
        // Valider les données
        $data = $request->validate([
            'email' => 'required|email',
            'nom_complet' => 'required|string|max:255',
            'photo_profil' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        // Si une nouvelle photo est envoyée
        if ($request->hasFile('photo_profil')) {
            $file = $request->file('photo_profil');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('photos', $filename, 'public');
            $data['photo_profil'] = 'storage/photos/' . $filename;
        }

        $user->update($data);

        return response()->json([
            'message' => 'Utilisateur mis à jour avec succès',
            'user' => $user,
            'success' => true,
            'error' => false
        ], 200);
    } catch (Exception $e) {
        return response()->json([
            'message' => 'Erreur de modification: ' . $e->getMessage(),
            'success' => false,
            'error' => true
        ], 500);
    }
}


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, $id)
    {
        try{
            $user = User::findOrFail($id);
            $user->delete();
            return response()->json([
                'message'=>'Le compte utilisateur a été supprimé avec succès.',
                'success'=>true,
                'error'=>false
            ]);

        }catch(Exception $e){
            return response()->json([
                'message'=>'Erreur de suppression de l\'utilisateur',
                'error'=>true,
                'success'=>false
            ], 500);
        }
    }
}
