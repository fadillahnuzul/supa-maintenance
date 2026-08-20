<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DivisionModel extends Model
{
    use SoftDeletes;

    protected $table = 'core.divisions';

    protected $primaryKey = 'id';

    protected $fillable = [
        'name',
        'is_active',
        'deleted_at',
    ];


}
