<?php

namespace Database\Factories;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Task>
 */
class TaskFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $start = fake()->numberBetween(7, 18);

        return [
            'user_id' => User::factory(),
            'title' => fake()->sentence(3),
            'task_date' => now()->toDateString(),
            'start_time' => sprintf('%02d:00', $start),
            'end_time' => sprintf('%02d:00', min($start + 1, 23)),
            'priority' => fake()->randomElement(['low', 'medium', 'high']),
            'notes' => fake()->optional()->sentence(),
            'is_done' => false,
        ];
    }
}
