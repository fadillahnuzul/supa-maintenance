<?php

namespace App\Listeners\Notification;

use App\Events\Notification\TicketVerified;
use App\Notifications\TicketNotification;
use Illuminate\Support\Facades\Notification;

class NotifyTicketVerified
{
    public function handle(TicketVerified $event): void
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
                title: 'Tiket Diverifikasi',
                message: "Tiket {$ticket->code} telah diverifikasi. Tiket selesai.",
                ticketCode: $ticket->code,
                notificationType: 'ticket_verified',
            )
        );
    }
}
