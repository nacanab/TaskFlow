<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class CommentaireRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'message'=>'required|string',
            'tache_id'=>'required|exists:taches,id',
            'user_id'=>'required|exists:users,id'
        ];
    }

    public function failedValidation(Validator $validator){
        throw new HttpResponseException(response()->json([
            'message'=>'Erreur de validation',
            'error'=>true,
            'success'=>false
        ]));
    }

    public function messages(){
        return [
            'message.required'=>'Le message est requis.',
            'tache_id.required'=>'Le commentaire est lié à une tâche.'
        ];
    }
}
