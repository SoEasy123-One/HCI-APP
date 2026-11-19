<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('body');
            $table->enum('category', ['notification', 'schedule', 'system'])->default('notification');
            $table->timestamp('posted_at');
            $table->timestamps();

            $table->index('posted_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
