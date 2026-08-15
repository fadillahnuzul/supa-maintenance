<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class MachineController extends Controller
{
    public function index()
    {
        return Inertia::render('machines/index');
        // return Inertia::render('machines/index', [
        //     'machines' => $machines,
        //     'storeUrl' => route('machines.store'),
        //     'updateBaseUrl' => '/machines',
        //     'deleteBaseUrl' => '/machines',
        // ]);
    }
}
