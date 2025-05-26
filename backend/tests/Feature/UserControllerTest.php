<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use function PHPUnit\Framework\assertJson;

/**
 * 
 * All methods to test register, login and logout methods.
 * To begin, I refresh a database to dump all existing data then I start to implement methods.
 * 
 * 
 */
class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test the road "api/v1/register"
     * @return void
     */
    public function test_user_register_then_login()
    {
        Storage::fake('public');

        $response = $this->postJson('/api/v1/register', [
            'nom_complet' => 'KASSANDE Judicaèl Delwendé',
            'email' => 'jdkasdel@gmail.com',
            'password' => 'Juste pour tester 1!',
            'password_confirmation' => 'Juste pour tester 1!',
            'photo_profil' =>$photo= UploadedFile::fake()->image('avatar.jpg')
        ]);
        $response->dump();
        $response->assertStatus(201)
                ->assertJsonStructure([
                    'user' => ['id', 'nom_complet', 'email', 'photo_profil'],
                    'token',
                    'token_type',
                    'message'
                ]);
        
        $this->assertDatabaseHas('users', ['email' => 'jdkasdel@gmail.com']);
        Storage::disk('public')->assertExists('PHOTO_PROFILS/'. $photo->hashName());
        $response->dump();

        $connexion = $this->postJson('api/v1/login',[
            'email' => 'jdkasdel@gmail.com',
            'password' => 'Juste pour tester 1!',
        ]);
        $connexion->assertStatus(200)
                  ->assertJsonStructure([
                        'message',
                        'token',
                        'token_type',
                        'user' =>['id','nom_complet','email','photo_profil']
                    ])
                    ->assertJson([
                        'user'=>[
                            'email'=>'jdkasdel@gmail.com'
                        ],
                        'token_type'=>'Bearer'
                    ]);
        $connexion->dump();

        $this->withHeaders([
            'Authorization' => 'Bearer '. $connexion->json('token')
        ])->postJson('api/v1/logout');
    }


    public function test_logout_without_token()
    {
        $response = $this->postJson('/api/v1/logout');
        
        $response->assertJsonStructure([
            'message',
        ]);
    }

    /**
     * Test to retrieve users informations.
     * @return void
     */
    public function test_get_users(){

        User::factory()->count(3)->create();
        
        $data = $this->getJson('api/v1/users');
        $data->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'error',
                'users'
            ])
            ->assertJson([
                'error'=>false,
                'success'=>true
            ])
            ->assertJsonCount(4, 'users'); // a cause de mon seeder.
        $data->dump();
    }

    /**
     * Test Update user information.
     * @return void
     */
    public function test_update_user(){
        $user = User::factory()->create([
            'nom_complet'=>'KASSANDE Judicael',
        ]);
        $new_nom='KASSANDE Judicael Delwende';
        $data = $this->putJson("api/v1/users/update/{$user->id}",
        [
            'nom_complet'=> $new_nom,
            'email'=>'delwende@gmail.com'
        ]);
        $data->assertStatus(200)
        ->assertJsonStructure([
            'message',
            'error',
            'success'
        ])
        ->assertJson([
            'error'=>false,
            'success'=>true
        ]);
        $this->assertDatabaseHas('users',[
            'nom_complet'=>$new_nom
        ]);
        $data->dump();
    }

    /**
     * Test delete user info.
     * @return void
     */
    public function test_delete_user(){
        $users = User::factory(4)->create();
        $id=$users[0]->id;
        $this->assertDatabaseCount('users',5);
        $data = $this->deleteJson("api/v1/users/delete/{$id}");
        $data->assertJson([
            'error'=>false,
            'success'=>true
        ]);
        $this->assertDatabaseMissing('users',[
            'id'=>$id
        ]);
        $this->assertDatabaseCount('users',4);
        $data->dump();
    }

    public function test_get_user(){
        $this->postJson('api/v1/login',[
            'email'=>'test@example.com',
            'password'=>'Juste pour tester1!'
        ]);
        $data = $this->getJson('api/v1/users/get_user');
        $data->assertSuccessful()
        ->assertJsonStructure([
            'user'
        ]);
        $data->dump();
    }
}

