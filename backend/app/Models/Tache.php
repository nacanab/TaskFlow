<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tache extends Model
{
    use HasFactory;
    protected $fillable=[
        'titre',
        'description',
        'priorite',
        'date_debut',
        'date_fin',
        'statut',
        'tag_id',
        'projet_id',
        'user_id',
        'jalon_id',
        'creator_id',
    ];

    public function tags(){
        return $this->belongsTo(Tags::class);
    }

    public function projet(){
        return $this->belongsTo(Projet::class);
    }

    public function user(){
        return $this->belongsTo(User::class);
    }
    public function jalon(){
        return $this->belongsTo(Jalon::class);
    }

    public function competences(){
        return $this->belongsToMany(Competence::class);
    }
}
