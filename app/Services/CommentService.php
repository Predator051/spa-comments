<?php

namespace App\Services;

use App\DTO\CreateCommentDTO;
use App\Events\CreateCommentProcessed;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Wrappers\CommentLengthAwarePaginatorWrapper;
use Illuminate\Pagination\LengthAwarePaginator;

readonly class CommentService
{
    public function __construct(private int $paginateCount = 25)
    {
    }

    public function getPaginatedRootComments(): LengthAwarePaginator
    {
        $paginator = Comment::whereNull('parent_id')
            ->orWhere('parent_id', '=', 0)
            ->latest('id')
            ->paginate($this->paginateCount);

        return CommentLengthAwarePaginatorWrapper::fromBaseClass($paginator);
    }

    public function getPaginatedChildrenComments(Comment $comment): LengthAwarePaginator
    {
        $paginator = $comment->children()->latest('created_at')->paginate($this->paginateCount);
        return CommentLengthAwarePaginatorWrapper::fromBaseClass($paginator);
    }

    public function createComment(CreateCommentDTO $commentDTO)
    {
        $commentData = $commentDTO->getFields();
        if (!empty($commentDTO->attachment)) {
            $storePath = $commentDTO->attachment->storePublicly(path: 'attachments', options: 'public');
            $commentData['file_path'] = $storePath;
        }

        $comment = Comment::create($commentData);
        CreateCommentProcessed::dispatch(new CommentResource($comment));
    }
}
