<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'id'=>1,
            'nom_complet' => 'Test User',
            'email' => 'test@example.com',
            'password'=>Hash::make('Juste pour tester1!')
        ]);

        /** It doesn't automatically define others attributes. */
        DB::table('competences')->insert(
            [
                        ['libelle'=>'PHP'],
                        ['libelle'=>'Laravel'],
                        ['libelle'=>'Flutter']
            ]);

        DB::table('equipes')->insert([
            ['libelle'=>'Equipe-A','user_id'=>1, 'description'=>'Ici, je veux tester la presence de la description'],
            ['libelle'=>'Equipe-B','user_id'=>1, 'description'=>null],
            ['libelle'=>'Equipe-C','user_id'=>1, 'description'=>null]
        ]);

        DB::table('tags')->insert([
            ['libelle'=>'Quickly'],
            ['libelle'=>'Danger']
        ]);

        DB::table('jalons')->insert([
            ['libelle'=>'Version-1','user_id'=>1],
            ['libelle'=>'Version-2','user_id'=>1]
        ]);
    }
}
