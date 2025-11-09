# ✅ Solution - Connexion base de données Vercel

## 🔍 Diagnostic

L'erreur montre maintenant le port `6543`, ce qui signifie que la variable `DATABASE_URL` est bien mise à jour sur Vercel. Mais la connexion échoue toujours.

## 🎯 Solution : Utiliser le port 5432 (connexion directe)

Le port `6543` (connection pooling) peut ne pas être accessible depuis Vercel ou nécessiter une configuration spéciale. Utilisons le port `5432` (connexion directe) qui est plus fiable.

## 📝 Instructions

### Sur Vercel :

1. **Allez sur Vercel** : https://vercel.com
2. **Sélectionnez votre projet** "Santasecret"
3. **Allez dans Settings** > **Environment Variables**
4. **Trouvez `DATABASE_URL`**
5. **Remplacez la valeur par** :
   ```
   postgresql://postgres:MyNabstirith974%40@db.wtlvjemlkejcifclafjn.supabase.co:5432/postgres
   ```
   **Important** : Port `5432` (pas 6543) et **sans** les paramètres `?pgbouncer=true&connection_limit=1`
6. **Sauvegardez**
7. **Redéployez le projet** (Redeploy)

## 🔍 Vérifications supplémentaires

### 1. Vérifier que le projet Supabase est actif

1. Allez sur https://supabase.com
2. Sélectionnez votre projet
3. **Vérifiez qu'il n'est pas en pause** (icône de pause en haut à droite)
4. Si le projet est en pause, **cliquez sur "Restore"** et attendez 2-3 minutes

### 2. Vérifier les restrictions réseau

1. Dans Supabase, allez dans **Settings** > **Database**
2. Cherchez la section **"Network Restrictions"** ou **"IP Allowlist"**
3. Vérifiez qu'il n'y a pas de restrictions qui bloquent Vercel
4. Si nécessaire, **ajoutez `0.0.0.0/0`** pour autoriser toutes les IPs (pour le développement)

### 3. Vérifier les credentials

1. Dans Supabase, allez dans **Settings** > **Database**
2. Vérifiez que le mot de passe est bien `MyNabstirith974@`
3. Si vous n'êtes pas sûr, **réinitialisez le mot de passe** :
   - Cliquez sur "Reset database password"
   - Choisissez un nouveau mot de passe (sans caractères spéciaux si possible)
   - Mettez à jour `DATABASE_URL` sur Vercel avec le nouveau mot de passe encodé

## ✅ Après modification

1. **Redéployez le projet** sur Vercel
2. **Attendez la fin du build**
3. **Vérifiez les logs** - vous devriez voir :
   ```
   🔌 Connecting to database: db.wtlvjemlkejcifclafjn.supabase.co:5432
   ```
4. **Testez l'application**

## 🚨 Si ça ne fonctionne toujours pas

### Option A : Vérifier la connection string depuis Supabase

1. Dans Supabase, allez dans **Settings** > **Database**
2. Dans la section **"Connection string"**, cliquez sur l'onglet **"URI"**
3. **Copiez la chaîne complète** (elle devrait ressembler à) :
   ```
   postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
   OU
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
   ```
4. **Encodez le mot de passe** si nécessaire (`@` → `%40`)
5. **Mettez à jour `DATABASE_URL` sur Vercel** avec cette valeur exacte

### Option B : Créer un nouveau projet Supabase

Si rien ne fonctionne, créez un nouveau projet Supabase et utilisez ses credentials.

