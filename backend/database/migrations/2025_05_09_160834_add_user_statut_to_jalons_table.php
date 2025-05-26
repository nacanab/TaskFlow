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
            $table->string('statut')->default('a faire')->after('date_debut');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('jalons', function (Blueprint $table) {
            //
            $table->dropColumn('statut');
        });
    }
};
