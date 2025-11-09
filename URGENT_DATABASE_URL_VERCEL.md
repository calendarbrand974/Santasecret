# 🚨 URGENT - Mise à jour DATABASE_URL sur Vercel

## ❌ Problème actuel

Les logs montrent que Vercel utilise toujours le port **6543** :
```
Can't reach database server at `db.wtlvjemlkejcifclafjn.supabase.co:6543`
```

## ✅ Solution immédiate

### 1. Allez sur Vercel

1. https://vercel.com
2. Sélectionnez votre projet "Santasecret"
3. **Settings** > **Environment Variables**

### 2. Mettez à jour DATABASE_URL

**Trouvez la variable `DATABASE_URL`** et **remplacez sa valeur** par :

```
postgresql://postgres:MyNastirith974@db.wtlvjemlkejcifclafjn.supabase.co:5432/postgres
```

**Points importants :**
- ✅ Port **5432** (pas 6543)
- ✅ Mot de passe : **MyNastirith974** (nouveau mot de passe)
- ✅ **SANS** les paramètres `?pgbouncer=true&connection_limit=1`

### 3. Vérifiez les environnements

Assurez-vous que les **3 environnements** sont cochés :
- ✅ Production
- ✅ Preview
- ✅ Development

### 4. Sauvegardez et redéployez

1. Cliquez sur **"Save"**
2. Allez dans l'onglet **"Deployments"**
3. Cliquez sur les **3 points** du dernier déploiement
4. Cliquez sur **"Redeploy"**
5. Attendez la fin du build

## 🔍 Vérification après redéploiement

Dans les **Build Logs** de Vercel, vous devriez voir :

```
🔌 [PRISMA] Connecting to database: db.wtlvjemlkejcifclafjn.supabase.co:5432
```

**Si vous voyez toujours `:6543`**, la variable n'a pas été mise à jour correctement.

## 📝 Checklist

- [ ] Variable `DATABASE_URL` trouvée sur Vercel
- [ ] Valeur mise à jour avec le port **5432**
- [ ] Nouveau mot de passe **MyNastirith974** utilisé
- [ ] Les 3 environnements sont cochés
- [ ] Projet redéployé
- [ ] Logs Vercel montrent le port **5432**


