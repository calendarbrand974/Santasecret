# 🔧 Dépannage - Erreur de connexion à la base de données Vercel

## ❌ Erreur rencontrée

```
Can't reach database server at `db.wtlvjemlkejcifclafjn.supabase.co:6543`
```

## 🔍 Vérifications à faire

### 1. Vérifier la variable DATABASE_URL sur Vercel

1. Allez sur https://vercel.com
2. Sélectionnez votre projet "Santasecret"
3. Allez dans **Settings** > **Environment Variables**
4. Vérifiez que `DATABASE_URL` existe et contient :
   ```
   postgresql://postgres:MyNabstirith974%40@db.wtlvjemlkejcifclafjn.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
   ```

### 2. Vérifier l'encodage du mot de passe

Le mot de passe contient `@` qui doit être encodé en `%40` dans l'URL.

**Format correct :**
```
postgresql://postgres:MyNabstirith974%40@db.wtlvjemlkejcifclafjn.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
```

**Format incorrect :**
```
postgresql://postgres:MyNabstirith974@db.wtlvjemlkejcifclafjn.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
```

### 3. Essayer avec le port 5432 (connexion directe)

Si le port 6543 (pooler) ne fonctionne pas, essayez avec le port 5432 :

1. Dans Vercel, modifiez la variable `DATABASE_URL`
2. Remplacez le port `6543` par `5432`
3. Retirez `?pgbouncer=true&connection_limit=1` (pas nécessaire pour le port direct)
4. Nouvelle valeur :
   ```
   postgresql://postgres:MyNabstirith974%40@db.wtlvjemlkejcifclafjn.supabase.co:5432/postgres
   ```
5. Redéployez le projet

### 4. Vérifier les credentials Supabase

1. Allez sur https://supabase.com
2. Sélectionnez votre projet
3. Allez dans **Settings** > **Database**
4. Vérifiez que le mot de passe est bien `MyNabstirith974@`
5. Si nécessaire, réinitialisez le mot de passe

### 5. Vérifier les restrictions IP sur Supabase

1. Dans Supabase, allez dans **Settings** > **Database**
2. Vérifiez la section **Connection Pooling** ou **Network Restrictions**
3. Assurez-vous que les connexions depuis Vercel sont autorisées
4. Si nécessaire, ajoutez `0.0.0.0/0` pour autoriser toutes les IPs (pour le développement)

## 🚀 Solution recommandée

### Option A : Utiliser le port 5432 (connexion directe)

Modifiez `DATABASE_URL` sur Vercel avec :

```
postgresql://postgres:MyNabstirith974%40@db.wtlvjemlkejcifclafjn.supabase.co:5432/postgres
```

**Avantages :**
- Plus simple
- Fonctionne généralement mieux avec Prisma
- Pas besoin de paramètres supplémentaires

**Inconvénients :**
- Pas de connection pooling (légèrement moins performant)

### Option B : Vérifier le connection pooling Supabase

1. Dans Supabase, allez dans **Settings** > **Database**
2. Vérifiez que le **Connection Pooling** est activé
3. Copiez la **Connection String** depuis Supabase (onglet "URI")
4. Assurez-vous d'utiliser le port **6543** (pas 5432)
5. Mettez à jour `DATABASE_URL` sur Vercel avec cette valeur exacte

## 📝 Format correct de DATABASE_URL

```
postgresql://[USER]:[PASSWORD_ENCODED]@[HOST]:[PORT]/[DATABASE]?[OPTIONS]
```

Exemple :
```
postgresql://postgres:MyNabstirith974%40@db.wtlvjemlkejcifclafjn.supabase.co:5432/postgres
```

Où :
- `postgres` = utilisateur
- `MyNabstirith974%40` = mot de passe (avec @ encodé en %40)
- `db.wtlvjemlkejcifclafjn.supabase.co` = host
- `5432` = port
- `postgres` = nom de la base de données

## ✅ Après modification

1. **Redéployez** le projet sur Vercel
2. Attendez la fin du build
3. Testez l'application
4. Vérifiez les logs Vercel pour confirmer que la connexion fonctionne

