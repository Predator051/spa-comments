<?php

namespace App\Http\Resources;

use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Comment */
class CommentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'text' => $this->text,
            'user_email' => $this->user_email,
            'username' => $this->username,
            'user_home_page_url' => $this->user_home_page_url,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'parent_id' => intval($this->parent_id),
            'file_url' => $this->file_url,
            'file_path' => $this->file_path
        ];
    }
}
