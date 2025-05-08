<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

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
            'parent_id' => 'nullable|integer|min:0',
            'text' => 'required|string',
            'user_email' => 'nullable|email|max:255',
            'username' => 'nullable|string|max:255',
            'user_home_page_url' => 'nullable|url|max:255',
        ];
    }
}
