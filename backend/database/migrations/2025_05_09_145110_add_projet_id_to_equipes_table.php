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
        Schema::table('jalons', function (Blueprint $table) {
            //
            $table->foreignId('projet_id')
              ->constrained('projets')
              ->onDelete('cascade'); // facultatif, selon ta logique métier
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('jalons', function (Blueprint $table) {
            //
            $table->dropForeign(['projet_id']);
            $table->dropColumn('projet_id');
        });
    }
};
