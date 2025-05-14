<?php

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
        Schema::table('taches', function (Blueprint $table) {
            //
            $table->dropForeign(['tag_id']);
            $table->dropForeign(['projet_id']);

            $table->foreignId('tag_id')->nullable()->change();
            $table->foreignId('projet_id')->nullable(false)->change();

            $table->foreign('tag_id')->references('id')->on('tags')->onDelete('cascade');
            $table->foreign('projet_id')->references('id')->on('projets')->onDelete('cascade');

            $table->foreignId('creator_id')->constrained('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('taches', function (Blueprint $table) {
            //
            $table->dropForeign(['tag_id']);
            $table->dropForeign(['projet_id']);

            $table->foreignId('tag_id')->nullable(false)->change();
            $table->foreignId('projet_id')->nullable()->change();

            $table->foreign('tag_id')->references('id')->on('tags')->onDelete('cascade');
            $table->foreign('projet_id')->references('id')->on('projets')->onDelete('cascade');

            $table->dropForeign(['creator_id']);
        });
    }
};
