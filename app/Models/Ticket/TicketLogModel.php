<?php

namespace App\Models\Ticket;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class TicketLogModel extends Model
{
    protected $table = 'maintenance.ticket_logs';

    public $timestamps = false;

    protected $fillable = [
        'ticket_id',
        'action',
        'from_status_id',
        'to_status_id',
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

    public function fromStatus()
    {
        return $this->belongsTo(
            TicketStatusModel::class,
            'from_status_id'
        );
    }

    public function toStatus()
    {
        return $this->belongsTo(
            TicketStatusModel::class,
            'to_status_id'
        );
    }
}
