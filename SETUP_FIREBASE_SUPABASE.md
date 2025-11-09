# Configuration avec Supabase (Recommandé)

Supabase est compatible PostgreSQL et offre une expérience similaire à Firebase, mais **sans changer votre code** !

## Avantages
- ✅ Compatible avec Prisma (PostgreSQL)
- ✅ Aucun changement de code nécessaire
- ✅ Gratuit jusqu'à 500 MB
- ✅ Interface graphique (comme Firebase)
- ✅ Authentification intégrée (optionnel)
- ✅ Storage pour fichiers
- ✅ Temps réel (Realtime)

## Configuration

### 1. Créer un compte Supabase

1. Allez sur https://supabase.com
2. Créez un compte gratuit
3. Créez un nouveau projet
4. Choisissez une région proche de vous

### 2. Récupérer la connection string

1. Dans votre projet Supabase, allez dans **Settings** > **Database**
2. Trouvez la section **Connection string**
3. Sélectionnez **URI** et copiez la chaîne
4. Elle ressemble à : `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

### 3. Mettre à jour .env

Remplacez `DATABASE_URL` dans votre fichier `.env` :

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
```

**Important** : Remplacez `[YOUR-PASSWORD]` par le mot de passe de votre base de données Supabase.

### 4. Lancer les migrations

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

C'est tout ! Votre code fonctionne exactement comme avant, mais avec Supabase.

---

# Option 2 : Firebase Firestore (Refonte nécessaire)

Si vous voulez vraiment utiliser Firebase Firestore, cela nécessite une **refonte complète** car :

- ❌ Firebase Firestore est NoSQL (pas de relations)
- ❌ Prisma ne supporte pas Firestore
- ❌ Toutes les requêtes doivent être réécrites
- ❌ Les transactions sont différentes
- ❌ Les relations doivent être gérées manuellement

## Ce qui devrait changer

1. **Remplacer Prisma** par le SDK Firebase Admin
2. **Réécrire toutes les requêtes** (plus de 50 fichiers)
3. **Adapter le schéma** pour NoSQL (collections au lieu de tables)
4. **Gérer les relations manuellement** (pas de foreign keys)
5. **Réécrire les migrations** (Firestore n'a pas de migrations)

## Si vous voulez quand même Firebase

Je peux vous aider à migrer, mais cela prendra du temps. Préférez-vous Supabase (5 minutes) ou Firebase (plusieurs heures de refonte) ?

