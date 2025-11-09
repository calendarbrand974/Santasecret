# Connection Pooling Supabase

## 🚀 Amélioration de performance facile

Le connection pooling de Supabase peut améliorer les performances de **20-30%** en réduisant la latence des connexions.

## Configuration

### Étape 1 : Modifier le fichier `.env`

Remplacez votre `DATABASE_URL` actuelle par celle avec le port de pooling :

**Avant :**
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
```

**Après :**
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1"
```

**Changement** : Port `5432` → `6543` (port de pooling)

### Étape 2 : Redémarrer l'application

```bash
# Arrêter le serveur (Ctrl+C)
# Puis redémarrer
pnpm dev
```

## ⚠️ Important

- Le port **6543** est pour le **pooling** (recommandé pour les applications)
- Le port **5432** est pour les **connexions directes** (pour les outils comme Prisma Studio)
- Utilisez **6543** pour votre application Next.js
- Utilisez **5432** uniquement pour Prisma Studio ou les outils de développement

## Vérification

Après le changement, testez l'application. Les temps de réponse devraient être légèrement meilleurs.

## Note

Si vous utilisez Prisma Studio (`pnpm db:studio`), vous devrez peut-être utiliser le port 5432 dans une variable d'environnement séparée, ou modifier temporairement le `.env`.

