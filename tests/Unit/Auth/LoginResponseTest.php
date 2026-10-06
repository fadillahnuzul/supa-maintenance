<?php

use App\Http\Responses\LoginResponse;
use App\Models\RoleModel;
use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Tests\TestCase;

uses(TestCase::class);

it('uses the application login response for Fortify', function () {
    expect(app(LoginResponseContract::class))
        ->toBeInstanceOf(LoginResponse::class);
});

it('redirects maintenance technicians to the ticket list after login', function () {
    $user = new User;
    $user->setRelation('roles', collect([
        new RoleModel([
            'code' => 'maintenance_technician',
            'is_active' => true,
        ]),
    ]));

    $request = Request::create('/login', 'POST');
    $request->setUserResolver(fn () => $user);

    $response = (new LoginResponse)->toResponse($request);

    expect($response->getTargetUrl())->toBe(route('tickets.index'));
});

it('keeps the default Fortify redirect for other roles', function () {
    $user = new User;
    $user->setRelation('roles', collect([
        new RoleModel([
            'code' => 'maintenance_admin',
            'is_active' => true,
        ]),
    ]));

    $request = Request::create('/login', 'POST');
    $request->setUserResolver(fn () => $user);

    $response = (new LoginResponse)->toResponse($request);

    expect($response->getTargetUrl())->toBe(route('dashboard'));
});
