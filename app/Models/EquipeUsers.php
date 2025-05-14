<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EquipeUsers extends Model
{
    use HasFactory;
    protected $fillable=[
        'user_id',
        'equipe_id',
        'role'
    ];

    public function user(){
        return $this->belongsTo(User::class);
    }

    public function equipe(){
        return $this->belongsTo(Equipe::class);
    }
}
