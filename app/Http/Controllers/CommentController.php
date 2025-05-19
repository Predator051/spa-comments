<?php

namespace App\Http\Controllers;

use App\Events\CreateCommentProcessed;
use App\Http\Requests\CreateCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Services\CommentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class CommentController extends Controller
{
    public function __construct(private CommentService $commentService)
    {

    }

    public function index(): Response
    {
        return Inertia::render('home', [
            'comments' => $this->commentService->getPaginatedRootComments()
        ]);
    }

    public function children(Comment $comment): JsonResponse
    {
        return response()->json($this->commentService->getPaginatedChildrenComments($comment));
    }

    public function store(CreateCommentRequest $request): JsonResponse
    {
        try {
            $this->commentService->createComment($request->getDTO());
            return response()->json(['message' => 'Комментарий сохранён.']);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        } catch (\Throwable $e) {
            Log::error($e->getMessage());
            return response()->json(['message' => 'Server error.'], 500);
        }
    }
}
