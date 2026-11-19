<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_student_can_register_and_receive_a_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Rene Baterbonia',
            'email' => 'rene@example.com',
            'course_section' => 'BSIT - 3B',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()
            ->assertJsonStructure(['user' => ['id', 'name', 'email', 'course_section'], 'token']);

        $this->assertDatabaseHas('users', [
            'email' => 'rene@example.com',
            'course_section' => 'BSIT - 3B',
        ]);
    }

    public function test_registration_requires_a_unique_email_and_confirmed_password(): void
    {
        User::factory()->create(['email' => 'rene@example.com']);

        $response = $this->postJson('/api/register', [
            'name' => 'Rene Baterbonia',
            'email' => 'rene@example.com',
            'password' => 'password123',
            'password_confirmation' => 'different-password',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_a_student_can_login_with_valid_credentials(): void
    {
        User::factory()->create([
            'email' => 'rene@example.com',
            'password' => 'password',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'rene@example.com',
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['user' => ['id', 'name', 'email'], 'token']);
    }

    public function test_login_fails_with_an_invalid_password(): void
    {
        User::factory()->create([
            'email' => 'rene@example.com',
            'password' => 'password',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'rene@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_an_authenticated_student_can_log_out(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth-token')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/logout');

        $response->assertOk();
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_the_current_user_endpoint_requires_authentication(): void
    {
        $this->getJson('/api/user')->assertUnauthorized();
    }
}
