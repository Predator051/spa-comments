<?php

use App\Http\Controllers\CommentController;
use Illuminate\Support\Facades\Route;

Route::get('/', [CommentController::class, 'index'])->name('comments.index');
Route::get('/comments/{comment}/children', [CommentController::class, 'children'])->name('comments.children');
Route::post('/comments', [CommentController::class, 'store'])->name('comments.store');

