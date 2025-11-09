# 🔍 Différence entre Local et Vercel

## ✅ Configuration locale (qui fonctionne)

```
DATABASE_URL="postgresql://postgres:MyNabstirith974%40@db.wtlvjemlkejcifclafjn.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1"
```

**Caractéristiques :**
- Port : `6543` (connection pooling)
- Paramètres : `?pgbouncer=true&connection_limit=1`

## ❌ Configuration Vercel (qui ne fonctionne pas)

Probablement :
```
postgresql://postgres:MyNabstirith974%40@db.wtlvjemlkejcifclafjn.supabase.co:5432/postgres
```

**Problèmes :**
- Port : `5432` (connexion directe, peut être bloqué)
- Pas de paramètres de pooling

## ✅ Solution : Utiliser la MÊME configuration

Sur Vercel, utilisez **EXACTEMENT** la même valeur qu'en local :

```
postgresql://postgres:MyNabstirith974%40@db.wtlvjemlkejcifclafjn.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
```

## 📝 Instructions pour Vercel

1. **Allez sur Vercel** : https://vercel.com
2. **Sélectionnez votre projet** "Santasecret"
3. **Allez dans Settings** > **Environment Variables**
4. **Trouvez `DATABASE_URL`**
5. **Remplacez la valeur par** :
   ```
   postgresql://postgres:MyNabstirith974%40@db.wtlvjemlkejcifclafjn.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
   ```
6. **Cochez les 3 environnements** : Production, Preview, Development
7. **Sauvegardez**
8. **Redéployez le projet**

## 🔍 Pourquoi ça fonctionne en local mais pas sur Vercel ?

### Raisons possibles :

1. **Variable non définie** : `DATABASE_URL` n'existe pas sur Vercel
2. **Valeur différente** : La valeur sur Vercel est différente de celle en local
3. **Port différent** : Port 5432 au lieu de 6543
4. **Paramètres manquants** : Les paramètres `?pgbouncer=true&connection_limit=1` manquent
5. **Restrictions réseau** : Supabase pourrait bloquer certaines IPs (mais ça devrait fonctionner)

## ✅ Vérification

Après avoir mis à jour `DATABASE_URL` sur Vercel avec la valeur exacte du local, redéployez et vérifiez les logs. Vous devriez voir :

```
🔌 Connecting to database: db.wtlvjemlkejcifclafjn.supabase.co:6543
```

Et la connexion devrait fonctionner !

