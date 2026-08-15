<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class OwnProfileController extends Controller
{
    public function index()
    {
        return Inertia::render('ownsettings/profile-settings');
    }
}
