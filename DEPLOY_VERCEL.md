# 🚀 Guide de déploiement sur Vercel

## Prérequis

1. Un compte Vercel (gratuit) : https://vercel.com
2. Un compte Supabase (pour la base de données)
3. Un compte Brevo (pour les emails)
4. Votre projet Git (GitHub, GitLab, ou Bitbucket)

## Étape 1 : Préparer le projet

### 1.1 Vérifier que tout est commité

```bash
git add .
git commit -m "Préparation pour déploiement Vercel"
git push
```

### 1.2 Ajouter le script de build Prisma

Vercel a besoin d'un script pour générer le client Prisma. Vérifiez que votre `package.json` contient :

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

## Étape 2 : Déployer sur Vercel

### 2.1 Via l'interface Vercel

1. Allez sur https://vercel.com
2. Cliquez sur **"Add New Project"**
3. Importez votre repository Git
4. Vercel détectera automatiquement Next.js
5. **Ne cliquez pas encore sur Deploy !** Configurez d'abord les variables d'environnement

### 2.2 Via la CLI Vercel

```bash
npm i -g vercel
vercel login
vercel
```

## Étape 3 : Configurer les variables d'environnement

Dans le dashboard Vercel, allez dans **Settings > Environment Variables** et ajoutez :

### Base de données (Supabase)

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
```

⚠️ **Important** : Remplacez `[PASSWORD]` par votre vrai mot de passe Supabase.

### Emails (Brevo)

```
EMAIL_PROVIDER=brevo
BREVO_API_KEY=xkeysib-votre_cle_api
BREVO_SENDER_EMAIL=noreply@votredomaine.com
BREVO_SENDER_NAME=Secret Santa
```

### Notifications Push (VAPID)

Générez les clés VAPID si vous ne les avez pas :

```bash
npx web-push generate-vapid-keys
```

Puis ajoutez dans Vercel :

```
VAPID_PUBLIC_KEY=votre_cle_publique
VAPID_PRIVATE_KEY=votre_cle_privee
VAPID_SUBJECT=mailto:votre@email.com
```

### URL de base (important pour les emails)

```
NEXT_PUBLIC_BASE_URL=https://votre-projet.vercel.app
```

Remplacez `votre-projet` par le nom de votre projet Vercel.

### Session (Secret)

Générez un secret aléatoire pour les sessions :

```bash
openssl rand -base64 32
```

Puis ajoutez :

```
SESSION_SECRET=votre_secret_genere
```

## Étape 4 : Configurer Prisma pour Vercel

Vercel exécute automatiquement `prisma generate` pendant le build grâce au script `postinstall`.

### Option : Ajouter un script de migration automatique

Créez un fichier `vercel.json` à la racine :

```json
{
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm install"
}
```

## Étape 5 : Lancer les migrations

Après le premier déploiement, vous devez lancer les migrations sur votre base Supabase :

### Option 1 : Via Vercel CLI

```bash
vercel env pull .env.local
npx prisma migrate deploy
```

### Option 2 : Via Supabase SQL Editor

1. Allez dans votre projet Supabase
2. Ouvrez le SQL Editor
3. Exécutez les migrations depuis `prisma/migrations/`

### Option 3 : Via votre machine locale

```bash
# Utiliser la DATABASE_URL de production
DATABASE_URL="votre_url_production" npx prisma migrate deploy
```

## Étape 6 : Vérifier le déploiement

1. Vérifiez que le build passe : https://vercel.com/dashboard
2. Testez l'application : https://votre-projet.vercel.app
3. Vérifiez les logs : Dashboard Vercel > Deployments > View Function Logs

## Étape 7 : Configurer le domaine personnalisé (optionnel)

1. Dans Vercel, allez dans **Settings > Domains**
2. Ajoutez votre domaine
3. Suivez les instructions DNS

## 🔧 Dépannage

### Erreur "Prisma Client not generated"

Ajoutez dans `package.json` :
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### Erreur de connexion à la base de données

- Vérifiez que `DATABASE_URL` est correct
- Vérifiez que Supabase autorise les connexions depuis Vercel
- Utilisez le port 6543 avec `pgbouncer=true`

### Les emails ne sont pas envoyés

- Vérifiez que `EMAIL_PROVIDER=brevo`
- Vérifiez que `BREVO_API_KEY` est correct
- Vérifiez que `BREVO_SENDER_EMAIL` est vérifié dans Brevo
- Vérifiez les logs Vercel pour les erreurs

### Les notifications push ne fonctionnent pas

- Vérifiez que les clés VAPID sont configurées
- Vérifiez que `NEXT_PUBLIC_BASE_URL` est correct
- Vérifiez que le service worker est accessible : `https://votre-projet.vercel.app/sw.js`

## 📝 Checklist de déploiement

- [ ] Projet commité et poussé sur Git
- [ ] Variables d'environnement configurées dans Vercel
- [ ] `DATABASE_URL` pointant vers Supabase
- [ ] `EMAIL_PROVIDER=brevo` et clé API configurée
- [ ] Clés VAPID générées et configurées
- [ ] `NEXT_PUBLIC_BASE_URL` configuré
- [ ] `SESSION_SECRET` généré et configuré
- [ ] Migrations Prisma exécutées sur la base de production
- [ ] Build Vercel réussi
- [ ] Application testée en production

## 🎉 C'est prêt !

Votre application Secret Santa est maintenant déployée sur Vercel !

