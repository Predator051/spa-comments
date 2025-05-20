<?php

namespace App\Http\Middleware;

use App\Http\Controllers\CommentController;
use Closure;
use Illuminate\Http\Request;

class CheckPageParameterMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $controller = app(CommentController::class);

        if ($request->has('page')) {
            return $controller->rootPaginate();
        }

        return $controller->index();
    }
}
