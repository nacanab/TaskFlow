<?php

namespace Tests\Feature;

use App\Models\Jalon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JalonControllerTest extends TestCase
{
   use RefreshDatabase;
   
   public function test_get_jalons(){
    $conn= $this->postJson('api/v1/login',[
        'email'=>'test@example.com',
        'password'=>'Juste pour tester1!'
    ]);
        $data = $this->getJson('api/v1/jalons/jalons_user');
        $data->assertSuccessful()
        ->assertJsonStructure([
            'jalons'
        ]);
        $data->dump();
   }

   public function test_store_jalon(){
        $reponse = $this->postJson('api/v1/jalons/create/',[
            'libelle'=>'Version-3'
        ]);
        $reponse->assertSuccessful()
        ->assertJson([
            'error'=>false,
            'success'=>true
        ]);
        $this->assertDatabaseHas('jalons', [
            'libelle'=>'Version-3'
        ]);
        $reponse->dump();
   }

   public function test_update_jalon(){
        $jalon = Jalon::find(1);
        $jalon->dump();
        $reponse = $this->putJson("api/v1/jalons/update/{$jalon->id}",[
            'libelle'=>'Version-11',
            'description'=>'Cette version a été modifiée'
        ]);
        $reponse->assertSuccessful()
        ->assertJson([
            'error'=>false,
            'success'=>true
        ]);

        $reponse->dump();

   }

   public function test_delete_jalon(){
    $data = $this->getJson(('api/v1/jalons/'));
    $data->dump();
        $jalon = Jalon::find(1);
        $reponse = $this->deleteJson("api/v1/jalons/delete/{$jalon->id}");
        $reponse->assertSuccessful()
                ->assertJson([
                    'error'=>false,
                    'success'=>true,
                ]);
        $this->assertDatabaseMissing('jalons',[
            'id'=> $jalon->id 
        ]);
        $reponse->dump();
   }

}
