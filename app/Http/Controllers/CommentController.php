<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateCommentRequest;
use App\Models\Comment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
        Comment::create($request->all());
        return response()->json();
    }
}
