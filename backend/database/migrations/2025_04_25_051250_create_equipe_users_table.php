<?php

use App\Helpers\Role;
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
        Schema::create('equipe_users', function (Blueprint $table) {
            $table->foreignId('equipe_id')->constrained('equipes');
            $table->foreignId('user_id')->constrained('users');
            $table->primary(['equipe_id', 'user_id']);
            $table->string('role')->default(Role::MEMBRE);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipe_users');
    }
};
