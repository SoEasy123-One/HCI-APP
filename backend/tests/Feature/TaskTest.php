<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_student_can_create_a_task(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/tasks', [
            'title' => 'Review HCI wireframes',
            'task_date' => now()->toDateString(),
            'start_time' => '12:00',
            'end_time' => '13:00',
            'priority' => 'high',
            'notes' => 'Prepare notes for the group critique.',
        ]);

        $response->assertCreated()
            ->assertJsonPath('title', 'Review HCI wireframes')
            ->assertJsonPath('is_done', false);

        $this->assertDatabaseHas('tasks', [
            'user_id' => $user->id,
            'title' => 'Review HCI wireframes',
            'priority' => 'high',
        ]);
    }

    public function test_task_creation_requires_valid_data(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/tasks', [
            'title' => '',
            'task_date' => 'not-a-date',
            'start_time' => '14:00',
            'end_time' => '13:00',
            'priority' => 'urgent',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['title', 'task_date', 'end_time', 'priority']);
    }

    public function test_a_student_only_sees_their_own_tasks(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $ownTask = Task::factory()->for($user)->create();
        Task::factory()->for($otherUser)->create();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/tasks');

        $response->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $ownTask->id);
    }

    public function test_tasks_can_be_filtered_by_date(): void
    {
        $user = User::factory()->create();
        $todayTask = Task::factory()->for($user)->create(['task_date' => now()->toDateString()]);
        Task::factory()->for($user)->create(['task_date' => now()->addDay()->toDateString()]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/tasks?date='.now()->toDateString());

        $response->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $todayTask->id);
    }

    public function test_a_student_can_mark_a_task_as_done(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create(['is_done' => false]);

        $response = $this->actingAs($user, 'sanctum')->patchJson("/api/tasks/{$task->id}", [
            'is_done' => true,
        ]);

        $response->assertOk()->assertJsonPath('is_done', true);
        $this->assertDatabaseHas('tasks', ['id' => $task->id, 'is_done' => true]);
    }

    public function test_a_student_cannot_update_another_students_task(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for(User::factory())->create(['is_done' => false]);

        $response = $this->actingAs($user, 'sanctum')->patchJson("/api/tasks/{$task->id}", [
            'is_done' => true,
        ]);

        $response->assertNotFound();
        $this->assertDatabaseHas('tasks', ['id' => $task->id, 'is_done' => false]);
    }

    public function test_a_student_can_delete_their_own_task(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create();

        $response = $this->actingAs($user, 'sanctum')->deleteJson("/api/tasks/{$task->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }
}
