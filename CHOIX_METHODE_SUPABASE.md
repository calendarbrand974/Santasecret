# 🎯 Choix de la méthode de connexion Supabase pour Vercel

## ✅ Pour Vercel (serverless) : **Transaction pooler**

### 📋 Configuration à utiliser

1. **Sur Supabase** : Sélectionnez **"Transaction pooler"** (pas "Direct connection")
2. **Port** : **6543** (pas 5432)
3. **Paramètres** : `pgbouncer=true&sslmode=require&connection_limit=1`

### 🔗 Chaîne de connexion complète

```
postgresql://postgres:MyNastirith974@db.wtlvjemlkejcifclafjn.supabase.co:6543/postgres?pgbouncer=true&sslmode=require&connection_limit=1
```

## ❌ Ne PAS utiliser : Direct connection

**Direct connection** (port 5432) :
- ❌ Ne fonctionne pas bien en serverless (Vercel)
- ❌ Connexions longues et persistantes
- ❌ Peut être bloqué par les restrictions réseau
- ❌ Pas optimisé pour les fonctions serverless

## ✅ Transaction pooler : Pourquoi c'est mieux

**Transaction pooler** (port 6543) :
- ✅ **Idéal pour serverless** (Vercel, fonctions courtes)
- ✅ Connexions courtes et isolées
- ✅ Pooling de connexions (plus efficace)
- ✅ Généralement toujours accessible
- ✅ Recommandé par Supabase pour les applications serverless

## 📝 Instructions sur Supabase

1. Allez sur https://supabase.com
2. Sélectionnez votre projet
3. Allez dans **"Settings"** > **"Database"**
4. Dans la section **"Connection string"** ou **"Connection pooling"** :
   - Sélectionnez **"Transaction pooler"** (pas "Direct connection")
   - Copiez la chaîne de connexion avec le port **6543**
5. Assurez-vous que les paramètres incluent :
   - `pgbouncer=true`
   - `sslmode=require`
   - `connection_limit=1`

## 🎯 Résumé

| Méthode | Port | Pour Vercel ? | Usage |
|---------|------|---------------|-------|
| **Transaction pooler** | **6543** | ✅ **OUI** | Serverless, fonctions courtes |
| Direct connection | 5432 | ❌ NON | VM, conteneurs long-lived |
| Session pooler | 6543 | ⚠️ Alternative | Alternative à Direct connection |

**Conclusion** : Utilisez **Transaction pooler** (port 6543) pour Vercel !

