<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class ProjetRequest extends FormRequest
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
            'titre'=>'required|string|max:255',
            'description'=>'nullable',
            'date_debut'=>'date',
            'date_fin'=>'date',
            'equipe_id'=>'required|exists:equipes,id'
        ];
    }

    public function failedValidation(\Illuminate\Contracts\Validation\Validator $validator){
        throw new HttpResponseException(response()->json([
            'message'=>'Erreur de vlidation',
            'error'=>true,
            'succcess'=>false
        ]));
    }

    public function messages(){
        return [
            'titre.required'=>'Le libellé est obligatoire.',
            'titre.string'=>'Le libellé doit être une chaîne de caractères.',
            'titre.max'=>'Le libellé est trop long.',
            'date_debut.date'=>'La date de début doit être valide',
            'date_fin.date'=>'La date de fin doit être valide',
            'equipe_id'=>'Le projet doit etre lié à un projet.',
            'date_debut.required'=>'La date de début est obligatoire',
            'date_fin.required'=>'La date de fin est obligatoire'
        ];
    }
}
