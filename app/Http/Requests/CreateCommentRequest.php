<?php

namespace App\Http\Requests;

use App\DTO\CreateCommentDTO;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;

class CreateCommentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'parent_id' => 'nullable|integer|min:1',
            'text' => [
                'required',
                function ($attribute, $value, $fail) {
                    $allowed = ['a', 'code', 'i', 'strong'];

                    $dom = new \DOMDocument();
                    libxml_use_internal_errors(true);
                    $dom->loadHTML('<div>' . $value . '</div>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
                    libxml_clear_errors();

                    $container = $dom->getElementsByTagName('div')->item(0); // Наш безопасный контейнер
                    if ($container) {
                        foreach ($container->getElementsByTagName('*') as $tag) {
                            if (!in_array($tag->nodeName, $allowed)) {
                                $fail("Tag <{$tag->nodeName}> not allowed.");
                            }
                        }
                    }
                }
            ],
            'user_email' => 'required|email|max:255',
            'username' => ['required', 'regex:/^[a-zA-Z0-9]+$/'],
            'user_home_page_url' => ['nullable', 'url', 'starts_with:http://,https://'],
            'attachment' => [
                'nullable',
                File::types(['jpeg', 'jpg', 'png', 'gif', 'txt']), // 100 KB
                function ($attribute, $file, $fail) {
                    if (str_starts_with($file->getMimeType(), 'image/')) {
                        [$width, $height] = getimagesize($file->getPathname());
                        if ($width>320 || $height>240) {
                            $fail('Image must be up to 320x240 pixels');
                        }
                    }
                    if ($file->getMimeType() === 'text/plain' && $file->getSize()>102400) {
                        $fail('TXT file must be under 100 KB');
                    }
                }
            ]
        ];
    }

    public function getDTO(): CreateCommentDTO
    {
        return new CreateCommentDTO(
            parentId: $this->integer('parent_id'),
            text: $this->input('text'),
            userEmail: $this->input('user_email'),
            username: $this->input('username'),
            userHomePageUrl: $this->input('user_home_page_url'),
            attachment: $this->file('attachment')
        );
    }
}
