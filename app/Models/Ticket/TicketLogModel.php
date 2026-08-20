<?php

namespace App\Models\Ticket;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class TicketLogModel extends Model
{
    protected $table = 'maintenance.ticket_logs';

    public $timestamps = false;

    protected $fillable = [
        'ticket_id',
        'action',
        'from_status',
        'to_status',
        'description',
        'created_by',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function ticket()
    {
        return $this->belongsTo(
            TicketModel::class,
            'ticket_id'
        );
    }

    public function createdBy()
    {
        return $this->belongsTo(
            User::class,
            'created_by'
        );
    }
}
