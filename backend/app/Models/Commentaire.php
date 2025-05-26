<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Commentaire extends Model
{
   use HasFactory;
   protected $fillable=[
    'message',
    'tache_id',
    'user_id'
   ];

   public function tache(){
    return $this->belongsTo(Commentaire::class);
   }
}
