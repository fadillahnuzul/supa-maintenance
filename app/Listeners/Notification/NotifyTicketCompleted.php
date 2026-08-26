<?php

namespace App\Listeners\Notification;

use App\Events\Notification\TicketCompleted;
use App\Models\User;
use Illuminate\Support\Facades\Notification;
use App\Notifications\TicketNotification;

class NotifyTicketCompleted
{
    public function handle(TicketCompleted $event): void
    {
        $ticket = $event->ticket;

        $verifiers = User::query()
            ->whereHas('roles', function ($query) {
                $query->where(
                    'code',
                    'maintenance_verifier'
                );
            })
            ->get();

        if ($verifiers->isEmpty()) {
            return;
        }

        Notification::send(
            $verifiers,
            new TicketNotification(
                ticketId: $ticket->id,
                title: 'Menunggu Verifikasi',
                message: "Pekerjaan tiket {$ticket->code} telah diselesaikan dan menunggu verifikasi.",
                ticketCode: $ticket->code,
                notificationType: 'ticket_completed'
            )
        );
    }
}
