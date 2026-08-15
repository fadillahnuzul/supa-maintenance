<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class OthersettingsController extends Controller
{
    public function index()
    {
        return Inertia::render('ownsettings/other-settings');
    }
}
