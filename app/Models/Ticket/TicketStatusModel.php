<?php

namespace App\Models\Ticket;

use Illuminate\Database\Eloquent\Model;

class TicketStatusModel extends Model
{
    protected $table =
        'maintenance.ticket_statuses';

    public $timestamps = false;

    protected $fillable = [
        'code',
        'name',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
