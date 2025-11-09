# 🔐 Dépannage : Erreur d'authentification Supabase

## ❌ Erreur

```
Authentication failed against database server at `aws-1-eu-west-1.pooler.supabase.com`, 
the provided database credentials for `postgres` are not valid.
```

## 🔍 Causes possibles

### 1. Format utilisateur incorrect pour le pooler

Pour le **Transaction pooler**, l'utilisateur doit être au format : `postgres.wtlvjemlkejcifclafjn` (avec le project ref)

**❌ Incorrect :**
```
postgresql://postgres:password@aws-1-eu-west-1.pooler.supabase.com:6543/postgres
```

**✅ Correct :**
```
postgresql://postgres.wtlvjemlkejcifclafjn:password@aws-1-eu-west-1.pooler.supabase.com:6543/postgres
```

### 2. Mot de passe incorrect ou mal encodé

Le mot de passe doit être correct et bien encodé dans l'URL si nécessaire.

### 3. Vérifier le mot de passe sur Supabase

1. Allez sur https://supabase.com
2. Sélectionnez votre projet
3. **Settings** > **Database**
4. Cherchez **"Database password"** ou **"Reset database password"**
5. Vérifiez ou réinitialisez le mot de passe

## ✅ Solution : Chaîne de connexion correcte

### Format complet pour Vercel :

```
postgresql://postgres.wtlvjemlkejcifclafjn:MyNastirith974@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require&connection_limit=1
```

### Points à vérifier :

1. **Utilisateur** : `postgres.wtlvjemlkejcifclafjn` (avec le project ref, pas juste `postgres`)
2. **Mot de passe** : `MyNastirith974` (vérifiez qu'il est correct sur Supabase)
3. **Host** : `aws-1-eu-west-1.pooler.supabase.com`
4. **Port** : `6543`
5. **Database** : `postgres`
6. **Paramètres** : `?pgbouncer=true&sslmode=require&connection_limit=1`

## 🔧 Si le mot de passe contient des caractères spéciaux

Si votre mot de passe contient des caractères spéciaux (`@`, `#`, `%`, etc.), ils doivent être encodés dans l'URL :

- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `&` → `%26`
- etc.

Exemple si le mot de passe est `MyPass@123` :
```
postgresql://postgres.wtlvjemlkejcifclafjn:MyPass%40123@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require&connection_limit=1
```

## 📝 Étapes de vérification

1. **Sur Supabase** :
   - Vérifiez le mot de passe dans Settings > Database
   - Si nécessaire, réinitialisez-le
   - Notez le nouveau mot de passe

2. **Sur Vercel** :
   - Allez dans Settings > Environment Variables
   - Trouvez `DATABASE_URL`
   - Vérifiez que l'utilisateur est `postgres.wtlvjemlkejcifclafjn` (pas juste `postgres`)
   - Vérifiez que le mot de passe est correct
   - Si le mot de passe contient des caractères spéciaux, encodez-les
   - Sauvegardez
   - Redéployez

## 🎯 Format à copier depuis Supabase

Sur Supabase, quand vous sélectionnez "Transaction pooler" et "URI", vous devriez voir quelque chose comme :

```
postgresql://postgres.wtlvjemlkejcifclafjn:[YOUR-PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres
```

Remplacez `[YOUR-PASSWORD]` par votre vrai mot de passe, puis ajoutez les paramètres à la fin.

