# 🔧 Configuration URL Supabase

## 📍 Où se trouve cette configuration

Dans Supabase :
1. Allez dans **Settings** > **Authentication** > **URL Configuration**
2. Section **"Site URL"**

## ✅ Configuration recommandée

### Pour le développement local :
```
http://localhost:3000
```

### Pour la production (Vercel) :
```
https://votre-projet.vercel.app
```

**Remplacez `votre-projet` par le nom réel de votre projet Vercel.**

## ⚠️ Important

Cette configuration est principalement pour :
- L'authentification Supabase (que vous n'utilisez pas)
- Les redirections après authentification
- Les emails d'authentification

**Elle ne devrait PAS affecter la connexion à la base de données**, mais il est préférable de la configurer correctement.

## 🔍 Vérification

1. Dans Supabase, allez dans **Settings** > **Authentication** > **URL Configuration**
2. Vérifiez que **"Site URL"** est configurée
3. Pour la production, mettez l'URL de votre site Vercel
4. Sauvegardez

## 🎯 Mais le vrai problème est ailleurs

Le problème de connexion à la base de données (`Can't reach database server`) n'est **PAS** lié à cette configuration URL.

Le problème vient probablement de :
1. **Le port utilisé** (6543 vs 5432)
2. **Les restrictions réseau** sur Supabase
3. **Le projet Supabase en pause**
4. **Les credentials incorrects**

Continuez avec les solutions précédentes pour la connexion DB.

