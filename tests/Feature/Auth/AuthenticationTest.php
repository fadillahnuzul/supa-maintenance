<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Laravel\Fortify\Features;

test('user passwords use Argon2id', function () {
    $user = User::factory()->create();

    expect(Hash::info($user->password)['algoName'])->toBe('argon2id');
});

test('login screen can be rendered', function () {
    $response = $this->get(route('login'));

    $response->assertOk();
});

test('guests cannot access the dashboard', function () {
    $this->get(route('dashboard'))
        ->assertRedirect(route('login'));
});

test('users can authenticate using either employee number format', function (string $employeeNumber) {
    $user = User::factory()->create(['id_karyawan' => '2604010122']);

    $response = $this->post(route('login.store'), [
        'id_karyawan' => $employeeNumber,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
})->with(['dotted' => '2604.01.0122', 'plain' => '2604010122']);

test('users with two factor enabled are redirected to two factor challenge', function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]);

    $user = User::factory()->withTwoFactor()->create();

    $response = $this->post(route('login'), [
        'id_karyawan' => $user->id_karyawan,
        'password' => 'password',
    ]);

    $response->assertRedirect(route('two-factor.login'));
    $response->assertSessionHas('login.id', $user->id);
    $this->assertGuest();
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post(route('login.store'), [
        'id_karyawan' => $user->id_karyawan,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('logout'));

    $response->assertRedirect(route('home'));

    $this->assertGuest();
});

test('users are rate limited', function () {
    $user = User::factory()->create();

    RateLimiter::increment(md5('login'.implode('|', ['2604010122', '127.0.0.1'])), amount: 5);

    $response = $this->post(route('login.store'), [
        'id_karyawan' => '2604.01.0122',
        'password' => 'wrong-password',
    ]);

    $response->assertTooManyRequests();
});
