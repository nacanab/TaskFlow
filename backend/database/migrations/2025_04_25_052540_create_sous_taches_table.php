<?php

use App\Helpers\Statut;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sous_taches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tache_id')->constrained('taches')->onDelete('cascade');
            $table->string('titre');
            $table->string('description')->nullable();
            $table->integer('priorite')->nullable();
            $table->date('date_debut');
            $table->date('date_fin');
            $table->string('statut')->default(Statut::EN_ATTENTE);
            $table->foreignId('tags_id')->nullable()->constrained('tags')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('jalon_id')->nullable()->constrained('jalons')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sous_taches');
    }
};
