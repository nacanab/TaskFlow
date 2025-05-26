<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class CompetenceRequest extends FormRequest
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
            'libelle'=>'required|string|max:255',
            'description'=>'nullable'
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
            'libelle.required'=>'Le libellé est obliagoire.',
            'libelle.max'=>'Le libellé est trop long',
            'libelle.string'=>'Le libellé doit être une chaîne de caractères.'
        ];
    }
}
