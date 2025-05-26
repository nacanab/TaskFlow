<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Equipe extends Model
{
    use HasFactory;
    protected $fillable=[
        'libelle',
        'user_id',
        'description'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function users(){
        return $this->belongsToMany(User::class, 'equipe_users')
        ->withPivot('role');
    }

}
