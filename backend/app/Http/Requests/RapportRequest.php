<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class RapportRequest extends FormRequest
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
            'contenu'=>'required|string',
            'tache_id'=>'required|exists:rapports,id'
        ];
    }

    public function failedValidation(Validator $validator){
        throw new HttpResponseException(response()->json([
            'error'=>true,
            'success'=>false,
            'message'=>'Erreur de validation'
        ]));
    }

    public function messages(){
        return [
            'contenu.required'=>'Le contenu est obligatoire.',
            'tache_id.required'=>'La tache est obligatoire.'
        ];
    }
}
