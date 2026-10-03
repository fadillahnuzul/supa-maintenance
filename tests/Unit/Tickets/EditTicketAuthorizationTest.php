<?php

use App\Http\Middleware\RoleMiddleware;
use App\Models\RoleModel;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

uses(TestCase::class);

it('restricts ticket edit routes to approvers and admins', function () {
    foreach (['tickets.edit', 'tickets.update'] as $routeName) {
        $route = Route::getRoutes()->getByName($routeName);

        expect($route)->not->toBeNull()
            ->and($route->gatherMiddleware())
            ->toContain('role:maintenance_approver,maintenance_admin');
    }
});

it('allows maintenance approvers and admins through the role middleware', function (
    string $roleCode
) {
    $user = new User;
    $user->setRelation('roles', collect([
        new RoleModel([
            'code' => $roleCode,
            'is_active' => true,
        ]),
    ]));

    $request = Request::create('/tickets/1/edit');
    $request->setUserResolver(fn () => $user);

    $response = (new RoleMiddleware)->handle(
        $request,
        fn () => new Response('Allowed'),
        'maintenance_approver',
        'maintenance_admin'
    );

    expect($response->getStatusCode())->toBe(200);
})->with([
    'maintenance_approver',
    'maintenance_admin',
]);

it('rejects users without an active permitted ticket edit role', function (
    string $roleCode,
    bool $isActive
) {
    $user = new User;
    $user->setRelation('roles', collect([
        new RoleModel([
            'code' => $roleCode,
            'is_active' => $isActive,
        ]),
    ]));

    $request = Request::create('/tickets/1/edit');
    $request->setUserResolver(fn () => $user);

    expect(fn () => (new RoleMiddleware)->handle(
        $request,
        fn () => new Response('Allowed'),
        'maintenance_approver',
        'maintenance_admin'
    ))->toThrow(HttpException::class);
})->with([
    ['maintenance_technician', true],
    ['maintenance_admin', false],
]);
