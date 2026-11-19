<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('class_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('subject');
            $table->date('class_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->string('room', 100)->nullable();
            $table->timestamps();

            $table->index(['user_id', 'class_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_schedules');
    }
};
