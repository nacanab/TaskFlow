<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class EquipeRequest extends FormRequest
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
     * @return array
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
            'success'=>false,
            'errors'=>$validator->errors(),
        ]));
    }

    public function messages(){
        return [
            'libelle.required'=>'Le libelle est obligatoire.',
            'libelle.max'=>'Votre libelle est trop long.'
        ];
    }
}
