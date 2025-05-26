<?php

namespace Tests\Feature;

use App\Models\Tags;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TagsControllerTest extends TestCase
{
    use RefreshDatabase;
    public function test_get_tags(){
        $data = $this->getJson('api/v1/tags/');
        $data->assertSuccessful()
        ->assertJsonStructure([
            'tags'
        ]);
        $data->dump();
    }

    public function test_store_tags(){
        $response = $this->postJson('api/v1/tags/create',[
            'libelle'=>'Urgence'
        ]);
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
        $response->dump();
    }

    public function test_update_tags(){
        $tags = Tags::find(1);
        $data = $this->putJson("api/v1/tags/update/{$tags->id}",[
            'libelle'=>'Warning'
        ]);
        $data->assertSuccessful()
        ->assertJson([
            'error'=>false,
            'success'=>true
        ]);
        $this->assertDatabaseHas('tags',[
            'libelle'=>'Warning'
        ]);
        $data->dump();
    }

    public function test_delete_tags(){
        $tags = Tags::find(1);
        $response = $this->deleteJson("api/v1/tags/delete/{$tags->id}");
        $response->assertSuccessful()
        ->assertJson([
            'error'=>false,
            'success'=>true
        ]);
        $this->assertDatabaseMissing('tags',[
            'id'=>$tags->id
        ]);
        $response->dump();
    }

}
