<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Competence extends Model
{
    use HasFactory;
    protected $fillable=[
        'libelle',
        'description'
    ];

    public function users(){
        return $this->belongsToMany(User::class);
    }

    public function taches(){
        return $this->belongsToMany(Tache::class);
    }
}
