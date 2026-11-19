<?php

namespace Database\Factories;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Notification>
 */
class NotificationFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'type' => fake()->randomElement(['task_reminder', 'task_completed', 'announcement', 'system', 'task_overdue']),
            'category' => fake()->randomElement(['announcement', 'schedule', 'other']),
            'title' => fake()->sentence(4),
            'message' => fake()->paragraph(),
            'read_at' => null,
        ];
    }
}
