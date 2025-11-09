# 📊 Guide pour lire les logs Vercel

## 🔍 Où trouver les logs

### 1. Logs de Build (pendant le déploiement)

1. Allez sur https://vercel.com
2. Sélectionnez votre projet "Santasecret"
3. Onglet **"Deployments"**
4. Cliquez sur le dernier déploiement
5. Vous verrez les **Build Logs**

**Ces logs montrent :**
- ✅ Installation des dépendances
- ✅ Génération de Prisma Client
- ✅ Compilation Next.js
- ❌ Erreurs de build (si présentes)

### 2. Logs de Runtime (pendant l'utilisation)

1. Allez sur https://vercel.com
2. Sélectionnez votre projet "Santasecret"
3. Onglet **"Deployments"**
4. Cliquez sur le dernier déploiement
5. Cliquez sur l'onglet **"Runtime Logs"** ou **"Functions"**

**Ces logs montrent :**
- 🔌 Connexions à la base de données
- 📊 Requêtes Prisma
- 🔐 Tentatives de connexion
- ❌ Erreurs d'exécution

## 🔍 Ce que vous devez chercher

### ✅ Logs de connexion Prisma (au démarrage)

Quand l'application démarre, vous devriez voir :

```
🔌 [PRISMA] Connecting to database: db.wtlvjemlkejcifclafjn.supabase.co:5432
🔌 [PRISMA] Database protocol: postgresql:
🔌 [PRISMA] Database path: /postgres
🔌 [PRISMA] Database search params: (vide ou avec paramètres)
✅ [PRISMA] Successfully connected to database
```

**OU** si ça échoue :

```
❌ [PRISMA] Failed to connect to database: [détails de l'erreur]
❌ [PRISMA] Error details: { message: "...", code: "...", meta: {...} }
```

### ✅ Logs de connexion utilisateur (quand vous testez)

Quand vous essayez de vous connecter, vous devriez voir :

```
[LOGIN API] DATABASE_URL defined: true
[LOGIN] Mode: email
[LOGIN] Tentative de connexion avec email: airnabs@gmail.com
[LOGIN API] Avant prisma.user.findUnique
[LOGIN API] Après prisma.user.findUnique
[LOGIN] Réponse status: 200
```

**OU** si ça échoue :

```
[LOGIN API] DATABASE_URL defined: true
[LOGIN API] Avant prisma.user.findUnique
[LOGIN API] Erreur Prisma: [détails]
[LOGIN] Réponse status: 500
```

## 🚨 Problèmes courants

### Problème 1 : Port 6543 au lieu de 5432

**Logs montrent :**
```
🔌 [PRISMA] Connecting to database: db.wtlvjemlkejcifclafjn.supabase.co:6543
```

**Solution :** La variable `DATABASE_URL` sur Vercel n'a pas été mise à jour. Mettez à jour avec le port **5432**.

### Problème 2 : DATABASE_URL non définie

**Logs montrent :**
```
❌ [PRISMA] DATABASE_URL is not defined in environment variables
```

**Solution :** Ajoutez la variable `DATABASE_URL` sur Vercel dans Settings > Environment Variables.

### Problème 3 : Connexion refusée

**Logs montrent :**
```
❌ [PRISMA] Failed to connect to database: Can't reach database server
```

**Solutions possibles :**
1. Vérifiez que le projet Supabase n'est pas en pause
2. Vérifiez les restrictions réseau sur Supabase
3. Vérifiez que le mot de passe est correct
4. Vérifiez que le port est correct (5432)

## 📝 Checklist de débogage

1. [ ] Build réussi sur Vercel
2. [ ] Variable `DATABASE_URL` définie sur Vercel
3. [ ] Port **5432** dans `DATABASE_URL` (pas 6543)
4. [ ] Mot de passe correct dans `DATABASE_URL`
5. [ ] Logs Prisma montrent le port **5432**
6. [ ] Logs Prisma montrent "Successfully connected" OU l'erreur exacte
7. [ ] Logs API montrent les détails de la requête

## 🎯 Prochaines étapes

1. **Attendez la fin du build** (vous devriez voir "Build Completed" ou "Build Failed")
2. **Testez la connexion** sur votre site déployé
3. **Consultez les Runtime Logs** sur Vercel
4. **Partagez les logs** avec moi pour que je puisse diagnostiquer

