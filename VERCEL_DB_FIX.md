# 🔧 Correction de la connexion à la base de données Vercel

## ❌ Problème

```
Can't reach database server at `db.wtlvjemlkejcifclafjn.supabase.co:5432`
```

## ✅ Solutions à essayer

### Solution 1 : Vérifier que DATABASE_URL est bien définie sur Vercel

1. **Allez sur Vercel** : https://vercel.com
2. **Sélectionnez votre projet** "Santasecret"
3. **Allez dans Settings** > **Environment Variables**
4. **Vérifiez que `DATABASE_URL` existe** et contient exactement :
   ```
   postgresql://postgres:MyNabstirith974%40@db.wtlvjemlkejcifclafjn.supabase.co:5432/postgres
   ```
5. **Vérifiez que les 3 environnements sont cochés** :
   - ✅ Production
   - ✅ Preview  
   - ✅ Development

### Solution 2 : Récupérer la connection string depuis Supabase

1. **Allez sur Supabase** : https://supabase.com
2. **Sélectionnez votre projet**
3. **Allez dans Settings** > **Database**
4. **Dans la section "Connection string"**, cliquez sur l'onglet **"URI"**
5. **Copiez la chaîne complète** (elle devrait ressembler à) :
   ```
   postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
   OU
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
   ```
6. **Important** : Si le mot de passe contient `@`, remplacez-le par `%40`
7. **Mettez à jour `DATABASE_URL` sur Vercel** avec cette valeur exacte
8. **Redéployez**

### Solution 3 : Vérifier que le projet Supabase est actif

1. **Allez sur Supabase** : https://supabase.com
2. **Vérifiez que votre projet n'est pas en pause**
3. Si le projet est en pause, **cliquez sur "Restore"** pour le réactiver
4. Attendez quelques minutes que le projet soit complètement restauré

### Solution 4 : Vérifier les restrictions réseau

1. **Dans Supabase**, allez dans **Settings** > **Database**
2. **Vérifiez la section "Network Restrictions"** ou **"Connection Pooling"**
3. **Assurez-vous qu'il n'y a pas de restrictions IP** qui bloquent Vercel
4. Si nécessaire, **ajoutez `0.0.0.0/0`** pour autoriser toutes les IPs (pour le développement)

### Solution 5 : Essayer avec le connection pooler (port 6543)

Si le port 5432 ne fonctionne pas, essayez avec le port 6543 (connection pooler) :

1. **Dans Supabase**, allez dans **Settings** > **Database**
2. **Trouvez la section "Connection Pooling"**
3. **Copiez la connection string du pooler** (port 6543)
4. **Format attendu** :
   ```
   postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
5. **Mettez à jour `DATABASE_URL` sur Vercel**
6. **Redéployez**

### Solution 6 : Réinitialiser le mot de passe Supabase

Si rien ne fonctionne, réinitialisez le mot de passe :

1. **Dans Supabase**, allez dans **Settings** > **Database**
2. **Cliquez sur "Reset database password"**
3. **Choisissez un nouveau mot de passe** (sans caractères spéciaux si possible)
4. **Mettez à jour `DATABASE_URL` sur Vercel** avec le nouveau mot de passe
5. **N'oubliez pas d'encoder les caractères spéciaux** (`@` → `%40`, `#` → `%23`, etc.)
6. **Redéployez**

## 🔍 Vérification du format DATABASE_URL

Le format correct est :
```
postgresql://[USER]:[PASSWORD_ENCODED]@[HOST]:[PORT]/[DATABASE]
```

**Exemple avec mot de passe contenant @ :**
```
postgresql://postgres:MyNabstirith974%40@db.wtlvjemlkejcifclafjn.supabase.co:5432/postgres
```

**Exemple avec mot de passe simple :**
```
postgresql://postgres:monMotDePasse123@db.wtlvjemlkejcifclafjn.supabase.co:5432/postgres
```

## 📝 Encodage des caractères spéciaux dans les mots de passe

- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`
- `?` → `%3F`
- `/` → `%2F`
- ` ` (espace) → `%20`

## ✅ Checklist de vérification

- [ ] La variable `DATABASE_URL` existe sur Vercel
- [ ] Les 3 environnements sont cochés (Production, Preview, Development)
- [ ] Le format de l'URL est correct
- [ ] Les caractères spéciaux du mot de passe sont encodés
- [ ] Le projet Supabase est actif (pas en pause)
- [ ] Les restrictions réseau n'bloquent pas Vercel
- [ ] Le port utilisé est correct (5432 ou 6543)
- [ ] Le projet a été redéployé après modification

## 🚀 Après avoir corrigé

1. **Redéployez le projet** sur Vercel
2. **Attendez la fin du build**
3. **Testez l'application**
4. **Vérifiez les logs Vercel** pour confirmer que la connexion fonctionne

