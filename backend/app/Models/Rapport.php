<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rapport extends Model
{
    use HasFactory;
    protected $fillable=[
        'contenu',
        'tache_id'
    ];

    public function tache(){
        return $this->belongsTo(Rapport::class);
    }
}
