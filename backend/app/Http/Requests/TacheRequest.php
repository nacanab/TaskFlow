<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class TacheRequest extends FormRequest
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
            'priorite'=>'nullable',
            'date_debut'=>'required|date',
            'date_fin'=>'required|date',
            'statut'=>'nullable',
            'tag_id'=>'nullable',
            'projet_id'=>'required|exists:projets,id',
            'user_id'=>'required|exists:users,id',
            'jalon_id'=>'nullable'
        ];
    }

    public function failedValidation(Validator $validator){
        throw new HttpResponseException(response()->json([
            'message'=>'Erreur de validation.',
            'error'=>true,
            'success'=>false
        ]));
    }

    public function messages(){
        return [
            'titre.required'=>'Le titre est réquis.',
            'date_debut.required'=>'La date de debut est requise.',
            'date_debut.date'=>'La date n\'est pas valide',
            'date_fin.date'=>'La date de fin n\'est pas valide',
            'date_fin.required'=>'La date de fin est obligatoire.',
            'projet_id.required'=>'La tâche doit être lié à un projet.',
            'user_id'=>'La tâche doit être lié à un utilisateur'
        ];
    }
}
