<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PieceJointe extends Model
{
    use HasFactory;
    protected $fillable=[
        'tache_id',
        'fichier_url',
        'description'
    ];

    public function tache(){
        return $this->belongsTo(Tache::class);
    }
}
