# 🚨 Solution immédiate : Problème de connexion DB

## ❌ Problème actuel

Vercel ne peut pas atteindre votre base de données Supabase :
```
Can't reach database server at db.wtlvjemlkejcifclafjn.supabase.co:5432
```

## ✅ Solution 1 : Utiliser le port de pooling (6543)

Le port **5432** (connexion directe) peut être bloqué par Supabase. Utilisez le port **6543** (pooling) qui est généralement toujours accessible.

### Sur Vercel :

1. Allez sur https://vercel.com
2. Sélectionnez votre projet "Santasecret"
3. **Settings** > **Environment Variables**
4. Trouvez `DATABASE_URL`
5. **Remplacez** la valeur par :

```
postgresql://postgres:MyNastirith974@db.wtlvjemlkejcifclafjn.supabase.co:6543/postgres?pgbouncer=true&sslmode=require&connection_limit=1
```

**Points importants :**
- ✅ Port **6543** (pooling)
- ✅ Paramètres `?pgbouncer=true&sslmode=require&connection_limit=1`
- ✅ `sslmode=require` est **obligatoire** pour Supabase (sécurité SSL)
- ✅ Mot de passe : **MyNastirith974**

6. Cochez les **3 environnements** : Production, Preview, Development
7. Cliquez sur **"Save"**
8. **Redéployez** le projet

## ✅ Solution 2 : Vérifier les restrictions réseau sur Supabase

Si le port 6543 ne fonctionne pas non plus :

1. Allez sur https://supabase.com
2. Sélectionnez votre projet
3. **Settings** > **Database**
4. Cherchez **"Network Restrictions"** ou **"IP Allowlist"**
5. **Désactivez** toutes les restrictions OU ajoutez `0.0.0.0/0`
6. Sauvegardez

## 📊 Consulter les logs serveur sur Vercel

Pour voir les logs détaillés que j'ai ajoutés :

1. Allez sur https://vercel.com
2. Sélectionnez votre projet "Santasecret"
3. Onglet **"Deployments"**
4. Cliquez sur le **dernier déploiement**
5. Cliquez sur l'onglet **"Runtime Logs"** ou **"Functions"**
6. Essayez de vous connecter sur votre site
7. Les logs devraient apparaître avec :
   - `🔌 [PRISMA] Connecting to database: ...`
   - `🔌 [PRISMA] DATABASE_URL (safe): ...`
   - `❌ [PRISMA] Failed to connect...` (si ça échoue)

## 🎯 Recommandation

**Commencez par la Solution 1** (port 6543) car :
- Le port de pooling est généralement toujours accessible
- C'est la méthode recommandée par Supabase pour les applications serverless
- Plus performant pour les connexions multiples

## 📝 Checklist

- [ ] `DATABASE_URL` mise à jour avec le port **6543**
- [ ] Paramètres `?pgbouncer=true&sslmode=require&connection_limit=1` ajoutés
- [ ] Les 3 environnements sont cochés
- [ ] Projet redéployé sur Vercel
- [ ] Test de connexion effectué
- [ ] Logs Vercel consultés pour vérifier


