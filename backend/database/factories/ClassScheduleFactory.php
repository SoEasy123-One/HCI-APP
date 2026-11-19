<?php

namespace Database\Factories;

use App\Models\ClassSchedule;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ClassSchedule>
 */
class ClassScheduleFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $start = fake()->numberBetween(7, 16);

        return [
            'user_id' => User::factory(),
            'subject' => fake()->randomElement([
                'Information Management 2',
                'Data Structures',
                'Web Systems',
                'Networking Fundamentals',
                'Human Computer Interaction',
            ]),
            'class_date' => now()->toDateString(),
            'start_time' => sprintf('%02d:00', $start),
            'end_time' => sprintf('%02d:00', min($start + 2, 23)),
            'room' => fake()->randomElement(['ComLab 2', 'Room 301', 'Room 204', 'Auditorium']),
        ];
    }
}
