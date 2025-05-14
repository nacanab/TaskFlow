## Ce que j'ai appris de nouveau 

1. Après la création du projet, nous installons le package Sanctum pour gérer l'authentification.

`` php artisan install:api ``

`` php artisan config:publish cors ``

2. Les traits sont comme des classes que d'autres classes y injecte en vue d'utiliser les méthodes s'y trouvant en les important au préalable (use Trait).

Laravel les utilise énormement pour ne pas alourdir les modèles.

#### Exemple: HasFactory, HasApiTokens ou encore Notifiable

3. Les test en Laravel
Il faut le paquet mbstring, sinon utilisez la commande suivante:

`` sudo apt-get install php-mbstring ``

Activer le driver de SQLite, car selon la configuration de phpunit.xml, c'est ce SGBD qui est utilisé pour stimuler les tests.

A noter que l'ordre de déclaration des routes sont importantes , comme ici par exemple:

`` Route::delete('/delete/all',[CompetenceController::class,'destroyAll'])->name('competences.destroy_all'); ``

``Route::delete('/delete/{competence}',[CompetenceController::class,'destroy'])->name('competences.destroy'); ``
