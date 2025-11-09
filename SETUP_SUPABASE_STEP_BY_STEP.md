# Guide étape par étape - Configuration Supabase

## Étape 1 : Créer un projet Supabase

1. Connectez-vous à https://supabase.com
2. Cliquez sur **"New Project"**
3. Remplissez les informations :
   - **Name** : `santasecret` (ou un nom de votre choix)
   - **Database Password** : Choisissez un mot de passe fort (⚠️ **SAVEZ-LE**, vous en aurez besoin)
   - **Region** : Choisissez la région la plus proche (ex: `West Europe` pour la France)
4. Cliquez sur **"Create new project"**
5. ⏳ Attendez 2-3 minutes que le projet soit créé

## Étape 2 : Récupérer la connection string

1. Une fois le projet créé, allez dans **Settings** (icône d'engrenage en bas à gauche)
2. Cliquez sur **Database** dans le menu de gauche
3. Descendez jusqu'à la section **"Connection string"**
4. Cliquez sur l'onglet **"URI"**
5. Vous verrez quelque chose comme :
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
6. **Copiez cette chaîne** (elle contient votre mot de passe)

## Étape 3 : Mettre à jour le fichier .env

1. Ouvrez le fichier `.env` dans votre projet
2. Remplacez la ligne `DATABASE_URL` par la chaîne que vous avez copiée
3. **Important** : Ajoutez `?pgbouncer=true&connection_limit=1` à la fin

Exemple :
```env
DATABASE_URL="postgresql://postgres:VotreMotDePasse@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
```

⚠️ **Attention** : Remplacez `VotreMotDePasse` par le mot de passe que vous avez défini lors de la création du projet.

## Étape 4 : Tester la connexion

Une fois le `.env` mis à jour, je lancerai les migrations pour vous !

