<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use App\Events\Notification\TicketCreated;
use App\Listeners\Notification\NotifyTicketCreated;
use App\Events\Notification\TicketAssigned;
use App\Listeners\Notification\NotifyTicketAssigned;
use App\Events\Notification\TicketCompleted;
use App\Listeners\Notification\NotifyTicketCompleted;

class EventServiceProvider extends ServiceProvider
{
    // protected $listen = [
    //     TicketCreated::class => [
    //         NotifyTicketCreated::class,
    //     ],

    //     TicketAssigned::class => [
    //         NotifyTicketAssigned::class,
    //     ],

    //     TicketCompleted::class => [
    //         NotifyTicketCompleted::class,
    //     ],
    // ];
}
