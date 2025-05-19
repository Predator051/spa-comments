<?php

namespace App\DTO;

use Illuminate\Http\UploadedFile;

final readonly class CreateCommentDTO
{
    public function __construct(
        public ?int $parentId,
        public string $text,
        public ?string $userEmail,
        public string $username,
        public ?string $userHomePageUrl,
        public ?UploadedFile $attachment
    ) {
    }

    public function getFields(): array
    {
        return [
            'parent_id' => $this->parentId,
            'text' => $this->text,
            'user_email' => $this->userEmail,
            'username' => $this->username,
            'user_home_page_url' => $this->userHomePageUrl,
            'file_path' => $this->attachment
        ];
    }
}
