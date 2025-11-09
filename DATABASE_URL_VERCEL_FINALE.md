# 🔗 DATABASE_URL finale pour Vercel

## ✅ Chaîne de connexion complète

Utilisez cette chaîne **exacte** sur Vercel (Settings > Environment Variables > DATABASE_URL) :

```
postgresql://postgres.wtlvjemlkejcifclafjn:Nouminou02136@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require&connection_limit=1
```

## 📋 Détails de la chaîne

- **User** : `postgres.wtlvjemlkejcifclafjn` (format pooler Supabase avec project ref - **OBLIGATOIRE**)
- **Password** : `Nouminou02136`
- **Host** : `aws-1-eu-west-1.pooler.supabase.com` (pooler Supabase)
- **Port** : `6543` ✅ (Transaction pooler)
- **Database** : `postgres`
- **Paramètres** :
  - `pgbouncer=true` - Active le pooling
  - `sslmode=require` - **OBLIGATOIRE** pour SSL
  - `connection_limit=1` - Limite les connexions pour serverless

## 🔍 Points importants

### Format utilisateur pour Transaction pooler

**✅ CORRECT** : `postgres.wtlvjemlkejcifclafjn` (avec le project ref)
**❌ INCORRECT** : `postgres` (sans le project ref)

Le format utilisateur pour le Transaction pooler Supabase doit inclure le project ref après `postgres.`

### Différences avec l'ancienne chaîne

| Ancienne | Nouvelle |
|---------|----------|
| `postgres:password@db.wtlvjemlkejcifclafjn.supabase.co:5432` | `postgres.wtlvjemlkejcifclafjn:password@aws-1-eu-west-1.pooler.supabase.com:6543` |
| Host direct (port 5432) | Host pooler (port 6543) |
| Utilisateur simple `postgres` | Utilisateur avec project ref `postgres.wtlvjemlkejcifclafjn` |

## 📝 Instructions Vercel

1. Allez sur https://vercel.com
2. Sélectionnez votre projet "Santasecret"
3. **Settings** > **Environment Variables**
4. Trouvez `DATABASE_URL`
5. **Remplacez** par la chaîne complète ci-dessus
6. **Cochez les 3 environnements** : Production, Preview, Development
7. Cliquez sur **"Save"**
8. **Redéployez** le projet

## ✅ Vérification

Après le redéploiement, testez la connexion. Les logs Vercel devraient montrer :
- `🔌 [PRISMA] Connecting to database: aws-1-eu-west-1.pooler.supabase.com:6543`
- Connexion réussie (pas d'erreur P1001)

