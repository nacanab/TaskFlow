<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Projet extends Model
{
    use HasFactory;

    protected $fillable=[
        'titre',
        'description',
        'date_debut',
        'date_fin',
        'equipe_id',
        'user_id'
    ];

    public function equipes(){
        return $this->belongsTo(Equipe::class);
    }
}


