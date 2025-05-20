<?php

use App\Http\Controllers\CommentController;
use App\Http\Middleware\CheckPageParameterMiddleware;
use Illuminate\Support\Facades\Route;

Route::get('/', [CommentController::class, 'index'])
    ->name('comments.index')
    ->middleware(CheckPageParameterMiddleware::class);
Route::get('/comments/{comment}/children', [CommentController::class, 'children'])
    ->name('comments.children');
Route::post('/comments', [CommentController::class, 'store'])
    ->name('comments.store');

