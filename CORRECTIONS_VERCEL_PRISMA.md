# ✅ Corrections appliquées pour Vercel + Supabase + Prisma

## 🔧 Problèmes corrigés

### 1. ✅ Runtime Edge → Node.js

**Problème** : Edge Runtime ne peut pas ouvrir de socket TCP vers Postgres.

**Solution** : Ajout de `export const runtime = 'nodejs'` à toutes les routes API qui utilisent Prisma.

**Fichiers modifiés** : Toutes les routes API (26 fichiers)

### 2. ✅ Requêtes DB pendant le build

**Problème** : Next.js peut exécuter des requêtes DB pendant la compilation.

**Solution** : Ajout de `export const dynamic = 'force-dynamic'` pour empêcher la précompilation.

**Fichiers modifiés** : Toutes les routes API (26 fichiers)

### 3. ✅ Client Prisma instancié globalement

**Problème** : Le pattern global était correct mais testait la connexion au démarrage.

**Solution** : Retiré le `setTimeout` qui testait la connexion au démarrage (peut causer des problèmes en serverless).

**Fichier modifié** : `lib/prisma.ts`

### 4. ✅ Chaîne de connexion DATABASE_URL

**Format requis pour Vercel + Supabase** :

```
postgresql://postgres:MyNastirith974@db.wtlvjemlkejcifclafjn.supabase.co:6543/postgres?pgbouncer=true&sslmode=require&connection_limit=1
```

**Points importants** :
- ✅ Port **6543** (pgBouncer pooling) - **OBLIGATOIRE** pour Vercel/serverless
- ✅ `pgbouncer=true` - Active le pooling de connexions
- ✅ `sslmode=require` - **OBLIGATOIRE** pour Supabase (connexion SSL sécurisée)
- ✅ `connection_limit=1` - Limite les connexions pour éviter les timeouts

## 📝 Configuration sur Vercel

### Étape 1 : Mettre à jour DATABASE_URL

1. Allez sur https://vercel.com
2. Sélectionnez votre projet "Santasecret"
3. **Settings** > **Environment Variables**
4. Trouvez `DATABASE_URL`
5. **Remplacez** par :

```
postgresql://postgres:MyNastirith974@db.wtlvjemlkejcifclafjn.supabase.co:6543/postgres?pgbouncer=true&sslmode=require&connection_limit=1
```

6. **Cochez les 3 environnements** : Production, Preview, Development
7. Cliquez sur **"Save"**

### Étape 2 : Redéployer

1. Allez dans **Deployments**
2. Cliquez sur **"Redeploy"** sur le dernier déploiement
3. Ou créez un nouveau commit et poussez-le

## ✅ Fichiers modifiés

### Routes API (26 fichiers) - Ajout de :
```typescript
// Forcer Node.js runtime (requis pour Prisma en serverless)
export const runtime = 'nodejs'
// Empêcher la précompilation (évite les requêtes DB pendant le build)
export const dynamic = 'force-dynamic'
```

- `app/api/auth/login/route.ts`
- `app/api/auth/join/route.ts`
- `app/api/profile/route.ts`
- `app/api/admin/groups/[id]/members/route.ts`
- `app/api/admin/groups/[id]/forbidden-pairs/route.ts`
- `app/api/admin/groups/[id]/members/[memberId]/resend-invitation/route.ts`
- `app/api/groups/[id]/assignment/target-name/route.ts`
- `app/api/admin/groups/[id]/assignments/route.ts`
- `app/api/admin/groups/[id]/draw/trigger/route.ts`
- `app/api/jobs/open-draw/route.ts`
- `app/api/admin/groups/[id]/settings/route.ts`
- `app/api/admin/groups/[id]/members/[memberId]/route.ts`
- `app/api/admin/groups/[id]/members/[memberId]/profile/route.ts`
- `app/api/admin/groups/[id]/forbidden-pairs/[pairId]/route.ts`
- `app/api/admin/groups/[id]/audit/route.ts`
- `app/api/groups/[id]/wishlist/me/route.ts`
- `app/api/auth/reset-password/route.ts`
- `app/api/auth/change-password/route.ts`
- `app/api/groups/[id]/assignment/reveal/route.ts`
- `app/api/push/subscribe/route.ts`
- `app/api/admin/groups/[id]/assignments/rematch/route.ts`
- `app/api/auth/forgot-password/route.ts`
- `app/api/auth/set-password/route.ts`
- `app/api/admin/groups/[id]/assignments/[giverId]/route.ts`
- `app/api/groups/[id]/status/route.ts`
- `app/api/groups/[id]/assignment/me/route.ts`

### lib/prisma.ts - Modifications :
- ✅ Retiré le `setTimeout` qui testait la connexion au démarrage
- ✅ Le pattern global reste correct (réutilise le client Prisma)

## 🎯 Résultat attendu

Après ces corrections et la mise à jour de `DATABASE_URL` sur Vercel :

1. ✅ Toutes les routes API utilisent Node.js runtime (pas Edge)
2. ✅ Aucune requête DB pendant le build
3. ✅ Client Prisma optimisé pour serverless
4. ✅ Connexion SSL sécurisée avec Supabase
5. ✅ Pooling de connexions activé (port 6543)

## 📊 Vérification

Après le redéploiement, testez la connexion. Les logs Vercel devraient montrer :
- `🔌 [PRISMA] Connecting to database: db.wtlvjemlkejcifclafjn.supabase.co:6543`
- `✅ [PRISMA] Successfully connected to database` (ou les requêtes fonctionnent)

Si l'erreur persiste, vérifiez :
1. Que `DATABASE_URL` est bien mise à jour sur Vercel avec le port **6543**
2. Que les paramètres `pgbouncer=true&sslmode=require&connection_limit=1` sont présents
3. Que le projet Supabase n'est pas en pause
4. Que les restrictions réseau sur Supabase sont désactivées

