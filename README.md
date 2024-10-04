
## L'architecture du projet :

Ce projet, dit frontend, est connecté à un service API backend que vous devez aussi lancer en local.
Le projet backend se trouve ici: https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-back

## Organiser son espace de travail :

-Clonez le projet backend 
-$ npm install sur le repertoire racine de Billed-app-FR-back
-$ npm run start
-Vérifiez en terminal que le back est bien audible sur le port 5678 par l'affichage suivant : "Example app listening on port 5678!"

## Lancez l'application Proto-BLD-Front en local :

-$ npm install dans le dossier racine de Proto-BLD-Front
-Live server ON sur http://127.0.0.1:3000/   ( pour l'installer $ npm install -g live-server)

## Lancer tous les tests en local avec Jest :

$ npm run test

## Lancer un seul test avec Jest :

Installez jest-cli :

```
$npm i -g jest-cli
$jest src/__tests__/your_test_file.js
```

## Comment voir la couverture de test ?

`http://127.0.0.1:3000/coverage/lcov-report/`

## Comptes et utilisateurs :

Vous pouvez vous connecter en utilisant les comptes:

### administrateur : 
```
utilisateur : admin@test.tld 
mot de passe : admin
```
### employé :
```
utilisateur : employee@test.tld
mot de passe : employee
```
