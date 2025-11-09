# Secret Santa - Application de tirage au sort

Application Secret Santa pour organiser un tirage au sort de Noël en famille avec révélations à la demande, listes de souhaits, et notifications.

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- PostgreSQL
- pnpm (ou npm)

### Installation

1. Cloner le projet
2. Installer les dépendances :
```bash
pnpm install
```

3. Configurer la base de données :
```bash
cp .env.example .env
# Éditer .env et remplir DATABASE_URL
```

4. Générer les clés VAPID pour les notifications push :
```bash
npx web-push generate-vapid-keys
# Copier les clés dans .env
```

5. Initialiser la base de données :
```bash
pnpm db:migrate
pnpm db:seed
```

6. Démarrer le serveur de développement :
```bash
pnpm dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📋 Fonctionnalités

- ✅ Révélation à la demande (chaque personne clique quand elle veut)
- ✅ Ouverture automatique du tirage à une date/heure précise (11/11/2025 11:00 Indian/Reunion)
- ✅ Contraintes de tirage (pas soi-même, pas de couple)
- ✅ Listes de souhaits (lettres au Père Noël)
- ✅ Interface admin pour voir les paires, supprimer et ré-appairer
- ✅ Onboarding sans email (email optionnel)
- ✅ Notifications email et web push
- ✅ Mot de passe oublié

## 🏗️ Structure

- `app/` - Pages Next.js (App Router)
- `components/` - Composants React réutilisables
- `lib/` - Utilitaires (auth, matching, push, email, etc.)
- `prisma/` - Schéma et migrations Prisma
- `public/` - Fichiers statiques (service worker)

## 🔧 Configuration

### Base de données

Le schéma Prisma définit les modèles suivants :
- User, Group, GroupMember
- Wishlist, ForbiddenPair
- Draw, Assignment
- PushSubscription, MagicLink
- EmailLog, AuditLog

### Notifications

- **Web Push** : Utilise VAPID (web-push)
- **Email** : Mock en dev, configurable pour Brevo/Mailjet en prod

### Job d'ouverture

Le job d'ouverture du tirage peut être appelé via :
```
GET /api/jobs/open-draw?secret=YOUR_SECRET
```

À configurer en cron pour s'exécuter à l'heure d'ouverture.

## 🧪 Tests

```bash
# Tests unitaires
pnpm test

# Tests E2E
pnpm test:e2e
```

## 📝 Scripts disponibles

- `pnpm dev` - Démarrer le serveur de développement
- `pnpm build` - Build de production
- `pnpm start` - Démarrer le serveur de production
- `pnpm db:migrate` - Appliquer les migrations
- `pnpm db:seed` - Charger les données initiales
- `pnpm db:studio` - Ouvrir Prisma Studio

## 🔐 Sécurité

- Cookies HTTPOnly pour les sessions
- CSRF protection (Double Submit Token)
- Rate limiting sur les routes d'authentification
- Mots de passe hashés avec Argon2
- Audit logs pour les actions admin

## 📦 Données initiales

Le seed crée :
- Groupe "Noël Famille 2025"
- 6 couples (12 membres)
- Codes de participation uniques pour chaque membre
- Paires interdites (couples)

Les codes de participation sont affichés dans la console après le seed.

## 🎨 Style

- Tailwind CSS
- Palette sombre (primary #0E7C66, accent #C1121F)
- Mobile-first

## 📄 Licence

MIT

