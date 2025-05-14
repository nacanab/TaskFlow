<?php

namespace Tests\Feature;

use App\Models\Equipe;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EquipeControllerTest extends TestCase
{
   use RefreshDatabase;


   /**
    * Getting all items.
    * @return void
    */
   public function test_get_equipes(){
        $data = $this->getJson('api/v1/equipes/');
        $data->assertSuccessful()
            ->assertJsonStructure([
                'equipes'
            ]);
        $data->dump();

   }

   /**
    * Test storing of a item.
    * I test that this item exists in a database.
    * @return void
    */
   public function test_store_equipe(){
        $data=[
            'libelle'=>'Equipe-Testing',
            'description'=>'Equipe pour effectuer les tests.',
        ];
        $response = $this->postJson('api/v1/equipes/create',$data);

        $response->assertSuccessful()
        ->assertJsonStructure([
            'message',
            'error',
            'success'
        ])
        ->assertJson([
            'error'=>false,
            'success'=>true
        ]);
        $this->assertDatabaseHas('equipes',$data);
        $response->dump();
   }

   /**
    * Test updating informations of an item.
    * I test the number of items after and before in the database to ensure the modification
    * doesn't modify the number of items.
    * @return void
    */
   public function test_update_equipe(){
        $this->assertDatabaseCount('equipes',3);
        $equipe = Equipe::findOrFail(1);
        $reponse = $this->putJson("api/v1/equipes/update/{$equipe->id}",[
            'libelle'=>'Equipe-AA',
            'description'=> $equipe->description
        ]);
        $reponse->assertSuccessful()
        ->assertJsonStructure([
            'message',
            'success',
            'error'
        ])
        ->assertJson([
            'error'=>false,
            'success'=>true
        ]);
        $this->assertDatabaseCount('equipes',3);
        $reponse->dump();
   }

   /**
    * For deleting a equipe with id=2.
    * I verify after deleting the absence of item to ensure me.
    * @return void
    */
   public function test_delete_equipe(){
        $equipe = Equipe::findOrFail(2);
        $reponse = $this->deleteJson("api/v1/equipes/delete/{$equipe->id}");
        $reponse->assertSuccessful();
        $this->assertDatabaseMissing('equipes', [
            'id' => $equipe->id
        ]);
        $reponse->dump();
   }

   public function test_get_equipes_user(){
        $conn= $this->postJson('api/v1/login',[
            'email'=>'test@example.com',
            'password'=>'Juste pour tester1!'
        ]);
        $conn->assertSuccessful();
        $data = $this->getJson('api/v1/equipes/equipes_user');
        $data->assertSuccessful();
        $data->dump();
   }
}
