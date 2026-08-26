<?php

namespace App\Listeners\Notification;

use App\Events\Notification\TicketAssigned;
use App\Models\User;
use App\Notifications\TicketNotification;
use Illuminate\Support\Facades\Notification;

class NotifyTicketAssigned
{
    public function handle(TicketAssigned $event): void
    {
        $ticket = $event->ticket;

        $technicians = $ticket->technicians
            ->pluck('employee')
            ->filter();

        if ($technicians->isEmpty()) {
            return;
        }

        Notification::send(
            $technicians,
            new TicketNotification(
                ticketId: $ticket->id,
                title: 'Tiket Ditugaskan',
                message: "Tiket {$ticket->code} telah ditugaskan kepada Anda.",
                ticketCode: $ticket->code,
                notificationType: 'ticket_assigned',
            )
        );
    }
}
