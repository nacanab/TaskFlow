<?php

use App\Http\Controllers\CompetenceController;
use App\Http\Controllers\EquipeController;
use App\Http\Controllers\EquipeUsersController;
use App\Http\Controllers\JalonController;
use App\Http\Controllers\PieceJointeController;
use App\Http\Controllers\ProjetController;
use App\Http\Controllers\RapportController;
use App\Http\Controllers\TacheController;
use App\Http\Controllers\TagsController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\NotificationController;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

/**
 * For register and login
 */
Route::prefix('/v1')->group(function(){

    Route::post('/register', [UserController::class, 'register'])->name('register');
    Route::post('/login',[UserController::class, 'login'])->name('login');
    Route::post('/logout',[UserController::class,'logout'])->name('logout');


    Route::prefix('/users')->group(function(){
        Route::get('/', [UserController::class,'index'])->name('users.get');
        Route::get('/get_user',[UserController::class, 'get_user'])->name('user.get');
        Route::put('/update/{user}',[UserController::class,'update'])->name('user.update');
        Route::delete('/delete/{user}',[UserController::class,'destroy'])->name('user.delete');
    });

    Route::prefix('/competences')->group(function(){
        Route::middleware('auth:sanctum')->get('/', [CompetenceController::class, 'index'])->name('competences.get');
        Route::middleware('auth:sanctum')->post('/create',[CompetenceController::class,'store'])->name('competences.create');
        Route::middleware('auth:sanctum')->get('/all',[CompetenceController::class,'getAll'])->name('competences.get_all');

        Route::middleware('auth:sanctum')->post('/taskCompetence/{task_id}',[CompetenceController::class,'addCompetencesTask'])->name('competences.tache');
        Route::middleware('auth:sanctum')->get('/taskCompetence/{task_id}',[CompetenceController::class,'getCompetencesTask'])->name('competences.tache.get');
        Route::middleware('auth:sanctum')->delete('/taskCompetence/{task_id}',[CompetenceController::class,'deleteCompetenceTask'])->name('competences.tache.delete');
        Route::put('/update',[CompetenceController::class,'update'])->name('competences.update');
        Route::delete('/delete/all',[CompetenceController::class,'destroyAll'])->name('competences.destroy_all');
        Route::middleware('auth:sanctum')->delete('/delete/{competence}',[CompetenceController::class,'destroy'])->name('competences.delete');
    });

    Route::prefix('/equipes')->group(function(){
        Route::middleware('auth:sanctum')->get('/equipes_user',[EquipeController::class, 'get_equipes_user'])->name('equipe.equipes_user');
        Route::get('/',[EquipeController::class, 'index'])->name('equipes.get');
        Route::middleware('auth:sanctum')->post('/create',[EquipeController::class, 'store'])->name('equipe.create');
        Route::middleware('auth:sanctum')->get('/equipes_belongs_user',[EquipeController::class, 'get_equipes_belongs_user'])->name('equipes.belong.user');
        Route::put('/update/{equipe}',[EquipeController::class, 'update'])->name('equipe.update');
        Route::middleware('auth:sanctum')->delete('/delete/{equipe}',[EquipeController::class, 'destroy'])->name('equipe.delete');
        Route::middleware('auth:sanctum')->get('/creator/{equipe_id}',[EquipeController::class, 'get_team_creator'])->name('equipe.creator.get');

        Route::get('/{equipe_id}',[EquipeUsersController::class, 'index'])->name('equipe.get.users');
        Route::middleware('auth:sanctum')->post('/{equipe_id}',[EquipeUsersController::class,'store'])->name('equipe.post.users');
        Route::delete('/detacher',[EquipeUsersController::class, 'destroy'])->name('equipe.user.detacher');

    });

    Route::prefix('/tags')->group(function(){
        Route::get('/',[TagsController::class, 'index'])->name('tags.get');
        Route::middleware('auth:sanctum')->post('/create',[TagsController::class, 'store'])->name('tags.create');
        Route::put('/update/{tags}',[TagsController::class, 'update'])->name('tags.update');
        Route::delete('/delete/{tags}', [TagsController::class, 'destroy'])->name('tags.delete');
    });

    Route::prefix('/jalons')->group(function(){
        Route::get('/jalons_user',[JalonController::class, 'get_jalons_user'])->name('jalon.jalons_user');
        Route::get('/',[JalonController::class, 'index'])->name('jalons.get');
        Route::get('/projet_jalons/{projet_id}',[JalonController::class, 'get_project_jalons'])->name('jalon.projet');
        Route::middleware('auth:sanctum')->post('/create',[JalonController::class, 'store'])->name('jalon.create');
        Route::put('/update/{jalon}',[JalonController::class, 'update'])->name('jalon.update');
        Route::delete('/delete/{jalon}',[JalonController::class, 'destroy'])->name('jalon.delete');

    });

    Route::prefix('/projets')->group(function(){
        Route::get('/projets_user',[ProjetController::class, 'get_projets_user'])->name('projet.projets_user');
        Route::get('/',[ProjetController::class, 'index'])->name('projets.get');
        Route::get('/{projet_id}',[ProjetController::class, 'get_projet'])->name('projet.get');
        Route::middleware('auth:sanctum')->post('/create',[ProjetController::class, 'store'])->name('projet.create');
        Route::put('/update/{projet}',[ProjetController::class, 'update'])->name('projet.update');
        Route::delete('/delete/{projet}', [ProjetController::class, 'destroy'])->name('projet.delete');
    });
    Route::middleware('auth:sanctum')->get('/mes_projets',[ProjetController::class, 'user_in_projets'])->name('projet.equipe');

    Route::prefix('/taches')->group(function(){
        Route::middleware('auth:sanctum')->get('/taches_user',[TacheController::class, 'get_taches_user'])->name('tache.taches_user');
        Route::get('/',[TacheController::class, 'index'])->name('taches.get');

        Route::middleware('auth:sanctum')->post('/create',[TacheController::class, 'store'])->name('tache.create');
        Route::put('/update/{tache}',[TacheController::class, 'update'])->name('tache.update');
        Route::put('/updateStatut/{tache}',[TacheController::class, 'updateStatut'])->name('tache.update.statut');
        Route::delete('/delete/{tache}', [TacheController::class, 'destroy'])->name('tache.delete');
    });

    Route::prefix('/rapports')->group(function(){
        Route::get('/',[RapportController::class, 'index'])->name('rapports.get');
        Route::get('/{tache_id}',[RapportController::class,'get_rapports_tache'])->name('rapports.tache');
        Route::post('/create',[RapportController::class, 'store'])->name('rapport.create');
        Route::put('/update/{rapport}',[RapportController::class, 'update'])->name('rapport.update');
        Route::delete('/delete/{rapport}', [RapportController::class, 'destroy'])->name('rapport.delete');
    });


    Route::prefix('/pieces_jointes')->group(function(){
        Route::get('/taches/{id}', [PieceJointeController::class, 'index']);
        Route::get('/download/{id}', [PieceJointeController::class, 'download']);
        Route::post('/{tache}', action: [PieceJointeController::class, 'store']);
        Route::delete('/{pieceJointe}', [PieceJointeController::class, 'destroy']);

    });

    Route::prefix('/notifications')->group(function(){
        Route::middleware('auth:sanctum')->get('/',[NotificationController::class, 'get_by_user'])->name('notification.user');
        Route::get('/tache/{tache_id}',[NotificationController::class, 'get_by_tache'])->name('notification.tache');
        Route::post('/create',[NotificationController::class,'store'])->name('notification.create');
        Route::post('/mark_as_read/{notification}',[NotificationController::class,'mark_as_read'])->name('notification.mark_as_read');
        Route::post('/mark_all_as_read',[NotificationController::class,'mark_all_as_read'])->name('notification.mark_all_as_read');
        Route::delete('/delete/{notification}',[NotificationController::class,'destroy'])->name('notification.delete');
    });

    
});

