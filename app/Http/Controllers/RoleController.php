<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function index()
    {
        return Inertia::render('ownsettings/role-settings');
        // return Inertia::render('roles/index', [
        //     'users' => $users,

        //     'storeUrl' => route('roles.store'),
        //     'updateBaseUrl' => '/roles',
        //     'resetPasswordBaseUrl' => '/roles/reset-password',
        //     'toggleStatusBaseUrl' => '/roles/status',
        //     'deleteBaseUrl' => '/roles',
        // ]);
    }
}
