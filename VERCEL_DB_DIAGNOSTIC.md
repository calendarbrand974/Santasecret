# 🔍 Diagnostic - Problème de connexion Vercel

## ❌ Erreur actuelle

```
Can't reach database server at `db.wtlvjemlkejcifclafjn.supabase.co:5432`
```

**Le port 5432 apparaît toujours** → La variable `DATABASE_URL` sur Vercel n'a probablement pas été mise à jour.

## 🔍 Vérifications à faire

### 1. Vérifier que DATABASE_URL est bien définie sur Vercel

1. Allez sur https://vercel.com
2. Sélectionnez votre projet "Santasecret"
3. Allez dans **Settings** > **Environment Variables**
4. **Cherchez `DATABASE_URL`**
5. **Vérifiez la valeur** :
   - Si elle contient `:5432` → Elle n'est pas à jour
   - Si elle contient `:6543` → Elle est à jour mais le problème vient d'ailleurs

### 2. Vérifier que le projet a été redéployé

1. Dans Vercel, allez dans l'onglet **Deployments**
2. Vérifiez la date/heure du dernier déploiement
3. Si vous avez modifié `DATABASE_URL` récemment, le dernier déploiement doit être **après** cette modification
4. Si ce n'est pas le cas, **déclenchez un nouveau déploiement** :
   - Cliquez sur les 3 points du dernier déploiement
   - Cliquez sur **"Redeploy"**

### 3. Vérifier les logs Vercel

1. Dans Vercel, allez dans l'onglet **Deployments**
2. Cliquez sur le dernier déploiement
3. Regardez les **Build Logs**
4. Cherchez la ligne : `🔌 Connecting to database: ...`
5. **Notez le port affiché** :
   - Si c'est `:5432` → La variable n'a pas été mise à jour
   - Si c'est `:6543` → La variable est à jour mais il y a un autre problème

### 4. Vérifier que le projet Supabase est actif

1. Allez sur https://supabase.com
2. Sélectionnez votre projet
3. **Vérifiez que le projet n'est pas en pause** (icône de pause en haut)
4. Si le projet est en pause, **cliquez sur "Restore"**
5. Attendez 2-3 minutes que le projet soit complètement restauré

### 5. Vérifier les restrictions réseau Supabase

1. Dans Supabase, allez dans **Settings** > **Database**
2. Cherchez la section **"Network Restrictions"** ou **"Connection Pooling"**
3. Vérifiez qu'il n'y a pas de restrictions IP qui bloquent Vercel
4. Si nécessaire, **ajoutez `0.0.0.0/0`** pour autoriser toutes les IPs (pour le développement)

### 6. Tester la connexion depuis votre machine

Pour vérifier que Supabase est accessible, testez depuis votre terminal local :

```bash
# Test de connexion avec psql (si installé)
psql "postgresql://postgres:MyNabstirith974%40@db.wtlvjemlkejcifclafjn.supabase.co:5432/postgres" -c "SELECT 1;"
```

Si ça fonctionne en local mais pas sur Vercel, c'est probablement un problème de :
- Variable d'environnement non définie/mal définie sur Vercel
- Projet non redéployé après modification
- Restrictions réseau Supabase

## ✅ Solution étape par étape

### Étape 1 : Mettre à jour DATABASE_URL sur Vercel

1. Allez sur Vercel > Settings > Environment Variables
2. **Supprimez** l'ancienne variable `DATABASE_URL` (si elle existe)
3. **Ajoutez** une nouvelle variable `DATABASE_URL` avec cette valeur :
   ```
   postgresql://postgres:MyNabstirith974%40@db.wtlvjemlkejcifclafjn.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
   ```
4. **Cochez les 3 environnements** : Production, Preview, Development
5. **Sauvegardez**

### Étape 2 : Forcer un redéploiement

1. Dans Vercel, allez dans **Deployments**
2. Cliquez sur les **3 points** du dernier déploiement
3. Cliquez sur **"Redeploy"**
4. Attendez la fin du build

### Étape 3 : Vérifier les logs

1. Après le redéploiement, regardez les **Build Logs**
2. Cherchez : `🔌 Connecting to database: ...`
3. Le port doit être `:6543`
4. Si vous voyez toujours `:5432`, la variable n'a pas été mise à jour correctement

## 🚨 Si ça ne fonctionne toujours pas

### Option A : Utiliser le port 5432 (connexion directe)

Si le port 6543 ne fonctionne pas, essayez avec le port 5432 :

```
postgresql://postgres:MyNabstirith974%40@db.wtlvjemlkejcifclafjn.supabase.co:5432/postgres
```

**Sans** les paramètres `?pgbouncer=true&connection_limit=1`

### Option B : Vérifier les credentials Supabase

1. Dans Supabase, allez dans **Settings** > **Database**
2. Vérifiez que le mot de passe est bien `MyNabstirith974@`
3. Si nécessaire, **réinitialisez le mot de passe**
4. Mettez à jour `DATABASE_URL` sur Vercel avec le nouveau mot de passe

### Option C : Créer un nouveau projet Supabase

Si rien ne fonctionne, créez un nouveau projet Supabase et utilisez ses credentials.

