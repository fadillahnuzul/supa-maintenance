<?php

namespace App\Models\Ticket;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class TicketTechnicianModel extends Model
{
    protected $table = 'maintenance.ticket_technicians';

    public $timestamps = false;

    protected $fillable = [
        'ticket_id',
        'employee_id',
        'role',
        'assigned_at',
        'created_at',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'created_at' => 'datetime',
    ];

    public function employee()
    {
        return $this->belongsTo(
            User::class,
            'employee_id'
        );
    }

    public function ticket()
    {
        return $this->belongsTo(
            TicketModel::class,
            'ticket_id'
        );
    }
}
