<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rules\Password;

class RegisterUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Definition of rules to validate the users input.
     *
     * @return array
     */
    public function rules(): array
    {
        return [
            'nom_complet' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users',
            'photo_profil' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'password' => [
                'required',
                'confirmed',
                Password::min(8)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
                    ->uncompromised()
            ],
            
        ];
    }

    /**
     * 
     * In order to override the failedValidation's methods in Laravel which redirect to a
     * previous url with the messages errors. I return now a JSON instead of. 
     * @param $validator
     * @return HttpResponseException
     */
    public function failedValidation(Validator $validator){
            throw new HttpResponseException(response()->json([
                'success'=>false,
                'error'=>true,
                'message'=>'Erreur de validation',
                'errorList'=> $validator->errors()
            ], 422));
    }

    /**
     * 
     * Personnalization of errors messages otherwise , messages was english.
     * @return array
     */
    public function messages()
    {
        return [
            'password.confirmed' => 'Les mots de passe ne correspondent pas.',
            'password.min' => 'Le mot de passe doit faire au moins :min caractères(vous êtes à :size caractères).',
            'password.mixed_case' => 'Le mot de passe doit contenir des majuscules et minuscules.',
            'password.letters' => 'Le mot de passe doit contenir au moins une lettre.',
            'password.numbers' => 'Le mot de passe doit contenir au moins un chiffre.',
            'password.symbols' => 'Le mot de passe doit contenir au moins un caractère spécial.',
            'password.uncompromised' => 'Oops, nous vous conseillons de changer de mot de passe, car le vôtre a été fuité.',
            'email.email'=>'Veuillez saisir une adresse mail valide.',
            'email.required'=>'L\'adresse mail est obligatoire.',
            'email.unique'=>'Votre adresse mail existe déjà.',
            'nom_complet.required'=>'Le nom complet est obligatoire.',
            'photo_profil.image'=>'Vous devez uploader une image',
            'photo_profil.mimes'=>'L\'extension de votre fichier n\'est pas autorisée.',
            'photo_profil.max'=>'L\'image ne doit pas dépasser :max Ko'
        ];
    }
}
