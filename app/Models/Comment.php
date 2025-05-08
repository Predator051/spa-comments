<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Comment extends Model
{
    protected $fillable = [
        'parent_id',
        'text',
        'user_email',
        'username',
        'user_home_page_url',
        'created_at',
        'updated_at'
    ];

    public function children(): HasMany
    {
        return $this->hasMany(Comment::class, 'parent_id')->latest();
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }
}
