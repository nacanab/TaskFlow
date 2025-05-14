<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nom_complet',
        'photo_profil',
        'est_admin',
        'photo_profil',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     * I add est_admin to permit the conversion for reading/writting
     * So, It store a number(0-1) in database but return a boolean(true-false)
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'est_admin'=>'boolean',
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function competences(){
        return $this->belongsToMany(Competence::class);
    }

    public function equipes(){
        return $this->belongsToMany(Equipe::class, 'equipe_users')
                    ->withPivot('role')
                    ->withTimestamps();
    }
}
