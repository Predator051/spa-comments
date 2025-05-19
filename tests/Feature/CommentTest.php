<?php

namespace Tests\Feature;

use App\Events\CreateCommentProcessed;
use App\Models\Comment;
use Illuminate\Support\Facades\Event;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Http\UploadedFile;
use Storage;
use Tests\TestCase;

class CommentTest extends TestCase
{
    use DatabaseMigrations;

    public function test_invalid_parent_id_negative()
    {
        $this->post('/comments', [
            'parent_id' => -1,
            'text' => 'valid text',
            'username' => 'username',
            'user_email' => 'valid@mail.com'
        ])->assertSessionHasErrors('parent_id');
    }

    public function test_invalid_parent_id_zero()
    {
        $this->post('/comments', [
            'parent_id' => 0,
            'text' => 'valid text',
            'username' => 'username',
            'user_email' => 'valid@mail.com'
        ])->assertSessionHasErrors('parent_id');
    }

    public function test_text_contains_disallowed_tag()
    {
        $this->post('/comments', [
            'text' => '<script>alert(1)</script>',
            'username' => 'username',
            'user_email' => 'valid@mail.com'
        ])->assertSessionHasErrors('text');
    }

    public function test_text_contains_allowed_tags()
    {
        Event::fake();

        $this->post('/comments', [
            'text' => '<strong>bold</strong><code>code</code>',
            'username' => 'username',
            'user_email' => 'valid@mail.com'
        ])->assertOk();

        Event::assertDispatched(CreateCommentProcessed::class);
    }

    public function test_invalid_email_format()
    {
        $this->post('/comments', [
            'text' => 'valid text',
            'username' => 'username',
            'user_email' => 'invalid-email'
        ])->assertSessionHasErrors('user_email');
    }

    public function test_valid_email()
    {
        Event::fake();

        $this->post('/comments', [
            'text' => 'valid text',
            'username' => 'username',
            'user_email' => 'valid@mail.com'
        ])->assertOk();

        Event::assertDispatched(CreateCommentProcessed::class);
    }

    public function test_invalid_username_with_special_chars()
    {
        $this->post('/comments', [
            'text' => 'valid text',
            'username' => 'user@name',
            'user_email' => 'valid@mail.com'
        ])->assertSessionHasErrors('username');
    }

    public function test_valid_username_alphanumeric()
    {
        Event::fake();

        $this->post('/comments', [
            'text' => 'valid text',
            'username' => 'User123',
            'user_email' => 'valid@mail.com'
        ])->assertOk();

        Event::assertDispatched(CreateCommentProcessed::class);

    }

    public function test_invalid_homepage_url_format()
    {
        $this->post('/comments', [
            'text' => 'valid text',
            'username' => 'username',
            'user_home_page_url' => 'ftp://invalid.com'
        ])->assertSessionHasErrors('user_home_page_url');
    }

    public function test_valid_homepage_url()
    {
        Event::fake();

        $this->post('/comments', [
            'text' => 'valid text',
            'username' => 'username',
            'user_email' => 'valid@mail.com',
            'user_home_page_url' => 'https://valid.com'
        ])->assertOk();

        Event::assertDispatched(CreateCommentProcessed::class);
    }

    public function test_image_attachment_exceeds_dimensions()
    {
        $file = UploadedFile::fake()->image('large.png', 500, 500);

        $this->post('/comments', [
            'text' => 'valid text',
            'username' => 'username',
            'attachment' => $file
        ])->assertSessionHasErrors('attachment');
    }

    public function test_txt_attachment_exceeds_size()
    {
        $file = UploadedFile::fake()->create('large.txt', 150);

        $this->post('/comments', [
            'text' => 'valid text',
            'username' => 'username',
            'user_email' => 'valid@mail.com',
            'attachment' => $file
        ])->assertSessionHasErrors('attachment');
    }

    public function test_valid_image_attachment()
    {
        Event::fake();
        Storage::fake('public');

        $file = UploadedFile::fake()->image('small.png', 100, 100);

        $this->post('/comments', [
            'text' => 'valid text',
            'username' => 'username',
            'user_email' => 'valid@mail.com',
            'attachment' => $file
        ])->assertOk();

        $comment = Comment::latest()->first();

        Event::assertDispatched(CreateCommentProcessed::class);
        Storage::disk('public')->assertCount('/attachments', 1);
        Storage::disk('public')->assertExists($comment->file_path);
    }

    public function test_valid_txt_attachment()
    {
        Event::fake();
        Storage::fake('public');

        $file = UploadedFile::fake()->create('file.txt', 90);

        $this->post('/comments', [
            'text' => 'valid text',
            'username' => 'username',
            'user_email' => 'valid@mail.com',
            'attachment' => $file
        ])->assertOk();

        $comment = Comment::latest()->first();

        Event::assertDispatched(CreateCommentProcessed::class);
        Storage::disk('public')->assertCount('/attachments', 1);
        Storage::disk('public')->assertExists($comment->file_path);
    }
}
