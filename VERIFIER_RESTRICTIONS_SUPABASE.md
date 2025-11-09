# 🔒 Vérifier les restrictions réseau sur Supabase

## 🚨 Problème actuel

Les logs Vercel montrent :
```
❌ [PRISMA] Failed to connect to database: Can't reach database server at db.wtlvjemlkejcifclafjn.supabase.co:5432
```

Cela signifie que **Vercel ne peut pas atteindre votre base de données Supabase**. Cela est généralement dû à des **restrictions réseau**.

## ✅ Solution : Vérifier et désactiver les restrictions réseau

### Étape 1 : Accéder aux paramètres de la base de données

1. Allez sur https://supabase.com
2. Connectez-vous à votre compte
3. Sélectionnez votre projet **"Santasecret"** (ou le nom de votre projet)
4. Dans le menu de gauche, cliquez sur **"Settings"** (⚙️)
5. Cliquez sur **"Database"** dans le sous-menu

### Étape 2 : Vérifier les restrictions IP

1. Cherchez la section **"Connection Pooling"** ou **"Network Restrictions"** ou **"IP Allowlist"**
2. Vérifiez s'il y a une liste d'IPs autorisées

### Étape 3 : Autoriser toutes les IPs (pour le développement)

**Option A : Si vous voyez "IP Allowlist" ou "Network Restrictions"**

1. **Supprimez toutes les restrictions** (laissez vide)
2. **OU** ajoutez `0.0.0.0/0` pour autoriser toutes les IPs
3. Cliquez sur **"Save"**

**Option B : Si vous ne trouvez pas cette option**

Supabase peut avoir des restrictions par défaut. Essayez :

1. Allez dans **"Settings"** > **"API"**
2. Cherchez **"Project URL"** et **"anon key"**
3. Vérifiez que le projet est **actif** (pas en pause)

### Étape 4 : Vérifier que le projet n'est pas en pause

1. Sur le dashboard Supabase, vérifiez l'état du projet
2. Si vous voyez **"Paused"**, cliquez sur **"Resume"** ou **"Restore"**
3. Attendez quelques minutes que le projet redémarre

### Étape 5 : Vérifier la connexion directe (port 5432)

1. Dans **"Settings"** > **"Database"**
2. Cherchez **"Connection string"** ou **"Connection info"**
3. Vérifiez que le port **5432** est bien disponible
4. Certains projets Supabase peuvent avoir uniquement le port **6543** (pooling) activé

## 🔍 Alternative : Utiliser le port de pooling (6543)

Si le port 5432 est bloqué, essayez le port de pooling :

### Sur Vercel :

1. Allez dans **Settings** > **Environment Variables**
2. Trouvez `DATABASE_URL`
3. Remplacez le port `5432` par `6543`
4. Ajoutez les paramètres de pooling :
   ```
   postgresql://postgres:MyNastirith974@db.wtlvjemlkejcifclafjn.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
   ```
5. Sauvegardez et redéployez

## 📝 Checklist

- [ ] Projet Supabase actif (pas en pause)
- [ ] Restrictions IP désactivées ou `0.0.0.0/0` ajouté
- [ ] Port 5432 disponible dans les paramètres Supabase
- [ ] `DATABASE_URL` sur Vercel utilise le bon port
- [ ] Mot de passe correct dans `DATABASE_URL`
- [ ] Projet redéployé sur Vercel après les modifications

## 🎯 Prochaines étapes

1. **Vérifiez les restrictions réseau** sur Supabase
2. **Désactivez-les** ou ajoutez `0.0.0.0/0`
3. **Redéployez** sur Vercel
4. **Testez la connexion** et consultez les nouveaux logs

## 💡 Note importante

Pour la **production**, il est recommandé de :
- Utiliser le **port de pooling (6543)** au lieu du port direct (5432)
- Configurer des **restrictions IP** spécifiques si nécessaire
- Utiliser **Supabase Connection Pooler** pour de meilleures performances

Mais pour le **développement et les tests**, vous pouvez autoriser toutes les IPs (`0.0.0.0/0`).

