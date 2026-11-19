<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class TaskController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'date' => ['nullable', 'date'],
            'priority' => ['nullable', 'in:low,medium,high'],
            'status' => ['nullable', 'in:done,pending'],
        ]);

        $query = $request->user()->tasks();

        if (! empty($filters['date'])) {
            $query->whereDate('task_date', $filters['date']);
        }

        if (! empty($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }

        if (($filters['status'] ?? null) === 'done') {
            $query->where('is_done', true);
        } elseif (($filters['status'] ?? null) === 'pending') {
            $query->where('is_done', false);
        }

        return response()->json(
            $query->orderBy('task_date')->orderBy('start_time')->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'task_date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'priority' => ['required', 'in:low,medium,high'],
            'notes' => ['nullable', 'string'],
            'is_done' => ['sometimes', 'boolean'],
        ]);

        $task = $request->user()->tasks()->create($data);

        return response()->json($task, 201);
    }

    public function show(Request $request, Task $task): JsonResponse
    {
        $this->authorizeTask($request, $task);

        return response()->json($task);
    }

    public function update(Request $request, Task $task): JsonResponse
    {
        $this->authorizeTask($request, $task);

        $data = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'task_date' => ['sometimes', 'required', 'date'],
            'start_time' => ['sometimes', 'required', 'date_format:H:i'],
            'end_time' => ['sometimes', 'nullable', 'date_format:H:i'],
            'priority' => ['sometimes', 'required', 'in:low,medium,high'],
            'notes' => ['sometimes', 'nullable', 'string'],
            'is_done' => ['sometimes', 'boolean'],
        ]);

        $task->fill($data);

        if ($task->end_time && $task->start_time && $task->end_time <= $task->start_time) {
            throw ValidationException::withMessages([
                'end_time' => ['The end time must be after the start time.'],
            ]);
        }

        $task->save();

        return response()->json($task);
    }

    public function destroy(Request $request, Task $task): JsonResponse
    {
        $this->authorizeTask($request, $task);

        $task->delete();

        return response()->json(['message' => 'Task deleted.']);
    }

    private function authorizeTask(Request $request, Task $task): void
    {
        abort_unless($task->user_id === $request->user()->id, 404);
    }
}
