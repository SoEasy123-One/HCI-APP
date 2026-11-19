<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClassScheduleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'date' => ['nullable', 'date'],
        ]);

        $query = $request->user()->classSchedules();

        if (! empty($filters['date'])) {
            $query->whereDate('class_date', $filters['date']);
        } else {
            $query->whereDate('class_date', '>=', now()->toDateString());
        }

        return response()->json(
            $query->orderBy('class_date')->orderBy('start_time')->get()
        );
    }
}
