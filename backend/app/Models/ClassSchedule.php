<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'subject',
        'class_date',
        'start_time',
        'end_time',
        'room',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
