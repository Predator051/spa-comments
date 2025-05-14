<?php

namespace App\Http\Controllers;

use App\Events\CreateCommentProcessed;
use App\Http\Requests\CreateCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class CommentController extends Controller
{
    public function index(Request $request): Response
    {
        $comments = Comment::whereNull('parent_id')
            ->latest()
            ->paginate(5);

        return Inertia::render('home', [
            'comments' => $comments
        ]);
    }

    public function children(Comment $comment): JsonResponse
    {
        $children = $comment->children()->latest()->paginate(4);
        return response()->json($children);
    }

    public function store(CreateCommentRequest $request): JsonResponse
    {
        $commentData = $request->all();

        $storePath = $request->file('attachment')?->storePublicly(path: 'attachments', options: 'public');
        if (!empty($storePath)) {
            $commentData['file_path'] = $storePath;
        }

        $comment = Comment::create($commentData);
        CreateCommentProcessed::dispatch(new CommentResource($comment));
        return response()->json();
    }
}
