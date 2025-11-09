# 🔍 Vérifications Supabase - Guide complet

## ✅ Vérifications essentielles

### 1. Vérifier que le projet Supabase est actif

1. Allez sur https://supabase.com
2. Connectez-vous à votre compte
3. **Regardez la liste de vos projets**
4. **Vérifiez l'icône à côté de votre projet** :
   - ✅ **Icône verte/active** = Le projet est actif
   - ⏸️ **Icône de pause** = Le projet est en pause
5. **Si le projet est en pause** :
   - Cliquez sur le projet
   - Cliquez sur **"Restore"** ou **"Resume"**
   - Attendez 2-3 minutes que le projet soit complètement restauré

### 2. Vérifier la connection string

1. Dans Supabase, allez dans **Settings** > **Database**
2. Descendez jusqu'à la section **"Connection string"**
3. Cliquez sur l'onglet **"URI"**
4. **Copiez la chaîne complète** (elle devrait ressembler à) :
   ```
   postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
   OU
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
   ```
5. **Comparez avec ce que vous avez sur Vercel** :
   - Le host doit correspondre
   - Le port doit correspondre
   - Le mot de passe doit être correct

### 3. Vérifier le mot de passe

1. Dans Supabase, allez dans **Settings** > **Database**
2. Cherchez la section **"Database password"**
3. **Vérifiez que le mot de passe est bien `MyNabstirith974@`**
4. Si vous n'êtes pas sûr, **réinitialisez le mot de passe** :
   - Cliquez sur **"Reset database password"**
   - Choisissez un nouveau mot de passe (sans caractères spéciaux si possible, ex: `MyNabstirith974`)
   - **Notez le nouveau mot de passe**
   - Mettez à jour `DATABASE_URL` sur Vercel avec le nouveau mot de passe encodé

### 4. Tester la connexion depuis votre machine

Pour vérifier que Supabase est accessible, testez depuis votre terminal local :

```bash
# Test avec psql (si installé)
psql "postgresql://postgres:MyNabstirith974%40@db.wtlvjemlkejcifclafjn.supabase.co:5432/postgres" -c "SELECT 1;"
```

Si ça fonctionne en local mais pas sur Vercel, c'est probablement un problème de :
- Variable d'environnement non définie/mal définie sur Vercel
- Format de l'URL différent

## 🎯 Solution recommandée : Utiliser la connection string exacte de Supabase

1. **Dans Supabase**, allez dans **Settings** > **Database**
2. **Dans "Connection string"**, onglet **"URI"**
3. **Copiez la chaîne complète** (celle qui commence par `postgresql://`)
4. **Si le mot de passe contient `@`**, remplacez-le par `%40` dans l'URL
5. **Sur Vercel**, mettez à jour `DATABASE_URL` avec cette valeur exacte
6. **Redéployez le projet**

## 🔍 Vérifier les logs Vercel

1. Dans Vercel, allez dans **Deployments**
2. Cliquez sur le dernier déploiement
3. Regardez les **Build Logs**
4. Cherchez la ligne : `🔌 Connecting to database: ...`
5. **Notez le host et le port affichés**
6. Comparez avec ce que vous avez dans Supabase

## 🚨 Si rien ne fonctionne

### Option A : Créer un nouveau projet Supabase

1. Créez un nouveau projet Supabase
2. Notez les nouveaux credentials
3. Lancez les migrations :
   ```bash
   npx prisma migrate deploy
   ```
4. Mettez à jour `DATABASE_URL` sur Vercel avec les nouveaux credentials

### Option B : Utiliser un autre service de base de données

- **Railway** : https://railway.app (gratuit avec crédits)
- **Neon** : https://neon.tech (gratuit)
- **PlanetScale** : https://planetscale.com (gratuit)

