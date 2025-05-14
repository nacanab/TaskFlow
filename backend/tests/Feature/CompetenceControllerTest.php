<?php

namespace Tests\Feature;

use App\Models\Competence;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CompetenceControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_get_competences(){
        $this->postJson('api/v1/login',[
            'email' => 'test@example.com',
            'password' => 'Juste pour tester1!',
        ]);

        $data = $this->getJson('api/v1/competences');
        $data->assertStatus(200)
        ->assertJsonStructure([
            'competences'
        ]);
        $data->dump();
    }


    public function test_update_competences()
    {
        $this->postJson('api/v1/login', [
            'email' => 'test@example.com',
            'password' => 'Juste pour tester1!',
        ]);

        $user = User::where('email', 'test@example.com')->first();
        $user->competences()->create(['libelle' => 'VueJS']);

        $response = $this->putJson('api/v1/competences/update', [
            'competences' => ['React', 'Laravel-Inertia']
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
            ]);

        $this->assertDatabaseMissing('competence_user', [
            'competence_id' => Competence::where('libelle', 'VueJS')->first()->id
        ]);
        $this->assertDatabaseHas('competences', ['libelle' => 'React']);
        $response->dump();
    }


    public function test_delete_competence()
    {
        $this->postJson('api/v1/login', [
            'email' => 'test@example.com',
            'password' => 'Juste pour tester1!',
        ]);

        $competence = Competence::create(['libelle' => 'Angular']);
        $user = User::where('email', 'test@example.com')->first();
        $user->competences()->attach($competence);

        $response = $this->deleteJson('api/v1/competences/delete/' . $competence->id);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Cette compétence a été supprimée.'
            ]);

        $this->assertDatabaseMissing('competence_user', [
            'user_id' => $user->id,
            'competence_id' => $competence->id
        ]);
        $response->dump();
    }

    public function test_delete_all_competences()
    {
        $this->postJson('api/v1/login', [
            'email' => 'test@example.com',
            'password' => 'Juste pour tester1!',
        ]);

        $user = User::where('email', 'test@example.com')->first();
        $user->competences()->createMany([
            ['libelle' => 'Python'],
            ['libelle' => 'Django']
        ]);

        $response = $this->deleteJson('api/v1/competences/delete/all/');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Toutes les compétences ont été supprimées'
            ]);

        $this->assertEquals(0, $user->competences()->count());
        $response->dump();
    }
}
