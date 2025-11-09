# 🚀 Guide de déploiement Vercel - Pas à pas

## 📋 ÉTAPE 1 : Initialiser Git (si pas déjà fait)

### 1.1 Vérifier si Git est initialisé
```bash
git status
```

Si vous voyez "not a git repository", continuez avec l'étape 1.2.

### 1.2 Initialiser Git
```bash
git init
git add .
git commit -m "Initial commit - Secret Santa app"
```

### 1.3 Créer un repository sur GitHub/GitLab/Bitbucket
1. Allez sur GitHub.com (ou GitLab/Bitbucket)
2. Cliquez sur "New repository"
3. Nommez-le (ex: `santasecret`)
4. Ne cochez PAS "Initialize with README"
5. Cliquez sur "Create repository"

### 1.4 Connecter votre projet local
```bash
git remote add origin https://github.com/VOTRE_USERNAME/santasecret.git
git branch -M main
git push -u origin main
```

---

## 📋 ÉTAPE 2 : Préparer les variables d'environnement

### 2.1 Lister vos variables actuelles
Votre fichier `.env` contient déjà :
- ✅ DATABASE_URL
- ✅ VAPID_PUBLIC_KEY
- ✅ VAPID_PRIVATE_KEY
- ✅ VAPID_SUBJECT
- ✅ EMAIL_PROVIDER
- ✅ BREVO_API_KEY
- ✅ BREVO_SENDER_EMAIL
- ✅ BREVO_SENDER_NAME
- ✅ NEXT_PUBLIC_BASE_URL

### 2.2 Vérifier SESSION_SECRET
Ouvrez votre `.env` et vérifiez si vous avez `SESSION_SECRET`.

Si non, générez-le :
```bash
# Sur Windows PowerShell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString() + (New-Guid).ToString()))
```

Ou utilisez un générateur en ligne : https://generate-secret.vercel.app/32

Ajoutez dans `.env` :
```
SESSION_SECRET=votre_secret_genere
```

---

## 📋 ÉTAPE 3 : Créer un compte Vercel

### 3.1 Aller sur Vercel
1. Allez sur https://vercel.com
2. Cliquez sur "Sign Up"
3. Choisissez "Continue with GitHub" (ou GitLab/Bitbucket)
4. Autorisez Vercel à accéder à votre compte

---

## 📋 ÉTAPE 4 : Déployer le projet

### 4.1 Via l'interface Vercel (Recommandé)

1. **Cliquez sur "Add New Project"**
   - Vous verrez la liste de vos repositories Git

2. **Sélectionnez votre repository `santasecret`**

3. **Configuration du projet**
   - Framework Preset : Next.js (détecté automatiquement)
   - Root Directory : `./` (par défaut)
   - Build Command : `prisma generate && next build` (déjà dans package.json)
   - Output Directory : `.next` (par défaut)
   - Install Command : `npm install` (par défaut)

4. **⚠️ IMPORTANT : Ne cliquez PAS encore sur "Deploy" !**
   - Cliquez d'abord sur "Environment Variables"

---

## 📋 ÉTAPE 5 : Configurer les variables d'environnement

### 5.1 Ajouter les variables une par une

Dans la section "Environment Variables", ajoutez chaque variable :

#### Base de données
```
Name: DATABASE_URL
Value: (copiez depuis votre .env local)
Environments: Production, Preview, Development (cochez les 3)
```

#### Emails
```
Name: EMAIL_PROVIDER
Value: brevo
Environments: Production, Preview, Development
```

```
Name: BREVO_API_KEY
Value: (copiez depuis votre .env local)
Environments: Production, Preview, Development
```

```
Name: BREVO_SENDER_EMAIL
Value: (copiez depuis votre .env local)
Environments: Production, Preview, Development
```

```
Name: BREVO_SENDER_NAME
Value: Secret Santa
Environments: Production, Preview, Development
```

#### Notifications Push
```
Name: VAPID_PUBLIC_KEY
Value: (copiez depuis votre .env local)
Environments: Production, Preview, Development
```

```
Name: VAPID_PRIVATE_KEY
Value: (copiez depuis votre .env local)
Environments: Production, Preview, Development
```

```
Name: VAPID_SUBJECT
Value: (copiez depuis votre .env local, ex: mailto:admin@example.com)
Environments: Production, Preview, Development
```

#### URL (à mettre à jour après le déploiement)
```
Name: NEXT_PUBLIC_BASE_URL
Value: https://votre-projet.vercel.app
Environments: Production, Preview, Development
```

⚠️ **Note** : Remplacez `votre-projet` par le nom réel après le premier déploiement.

#### Session
```
Name: SESSION_SECRET
Value: (copiez depuis votre .env local)
Environments: Production, Preview, Development
```

### 5.2 Vérifier toutes les variables
Assurez-vous d'avoir ajouté toutes les variables listées ci-dessus.

---

## 📋 ÉTAPE 6 : Lancer le déploiement

### 6.1 Cliquer sur "Deploy"
Une fois toutes les variables ajoutées, cliquez sur le bouton **"Deploy"**.

### 6.2 Attendre le build
- Le build prendra 2-5 minutes
- Vous verrez les logs en temps réel
- Vercel va :
  1. Installer les dépendances (`npm install`)
  2. Générer Prisma Client (`prisma generate`)
  3. Builder Next.js (`next build`)

### 6.3 Vérifier les erreurs
Si le build échoue :
- Vérifiez les logs d'erreur
- Vérifiez que toutes les variables d'environnement sont bien configurées
- Vérifiez que `DATABASE_URL` est correct

---

## 📋 ÉTAPE 7 : Mettre à jour NEXT_PUBLIC_BASE_URL

### 7.1 Récupérer l'URL de production
Après le déploiement réussi, Vercel vous donnera une URL comme :
```
https://santasecret-xxxxx.vercel.app
```

### 7.2 Mettre à jour la variable
1. Allez dans **Settings > Environment Variables**
2. Trouvez `NEXT_PUBLIC_BASE_URL`
3. Cliquez sur "Edit"
4. Remplacez la valeur par votre URL Vercel
5. Cliquez sur "Save"
6. **Redéployez** : Allez dans "Deployments" > Cliquez sur les 3 points > "Redeploy"

---

## 📋 ÉTAPE 8 : Lancer les migrations Prisma

### 8.1 Option 1 : Via Vercel CLI (Recommandé)

Installez Vercel CLI :
```bash
npm i -g vercel
```

Connectez-vous :
```bash
vercel login
```

Récupérez les variables d'environnement :
```bash
vercel env pull .env.production
```

Lancez les migrations :
```bash
# Utiliser la DATABASE_URL de production
$env:DATABASE_URL = (Get-Content .env.production | Select-String "DATABASE_URL").ToString().Split('=')[1]
npx prisma migrate deploy
```

### 8.2 Option 2 : Via votre machine locale

Utilisez directement votre `DATABASE_URL` de production :
```bash
# Sur Windows PowerShell
$env:DATABASE_URL = "votre_url_supabase_production"
npx prisma migrate deploy
```

### 8.3 Option 3 : Via Supabase SQL Editor

1. Allez dans votre projet Supabase
2. Ouvrez "SQL Editor"
3. Exécutez les migrations depuis `prisma/migrations/`

---

## 📋 ÉTAPE 9 : Tester l'application

### 9.1 Tester l'URL
Ouvrez votre URL Vercel dans le navigateur :
```
https://votre-projet.vercel.app
```

### 9.2 Vérifier les fonctionnalités
- ✅ Page d'accueil s'affiche
- ✅ Connexion avec code de participation
- ✅ Création de compte
- ✅ Accès à la wishlist
- ✅ Interface admin

### 9.3 Tester les emails
1. Créez un nouveau membre avec un email
2. Vérifiez que l'email d'invitation est bien envoyé
3. Vérifiez les logs Vercel pour les erreurs

---

## 📋 ÉTAPE 10 : Configurer un domaine personnalisé (Optionnel)

### 10.1 Ajouter un domaine
1. Dans Vercel, allez dans **Settings > Domains**
2. Cliquez sur "Add Domain"
3. Entrez votre domaine (ex: `santasecret.com`)
4. Suivez les instructions DNS

### 10.2 Mettre à jour NEXT_PUBLIC_BASE_URL
Une fois le domaine configuré, mettez à jour `NEXT_PUBLIC_BASE_URL` avec votre nouveau domaine.

---

## 🔧 Dépannage

### Erreur "Prisma Client not generated"
✅ Déjà résolu avec `postinstall` dans package.json

### Erreur de connexion à la base de données
- Vérifiez que `DATABASE_URL` est correct
- Vérifiez que Supabase autorise les connexions
- Utilisez le port 6543 avec `pgbouncer=true`

### Les emails ne sont pas envoyés
- Vérifiez les logs Vercel
- Vérifiez que `BREVO_API_KEY` est correct
- Vérifiez que `BREVO_SENDER_EMAIL` est vérifié dans Brevo

### Build échoue
- Vérifiez les logs de build dans Vercel
- Vérifiez que toutes les variables d'environnement sont configurées
- Vérifiez que `package.json` contient bien `postinstall`

---

## ✅ Checklist finale

- [ ] Git initialisé et projet poussé sur GitHub/GitLab
- [ ] Compte Vercel créé
- [ ] Toutes les variables d'environnement configurées
- [ ] Déploiement réussi
- [ ] `NEXT_PUBLIC_BASE_URL` mis à jour
- [ ] Migrations Prisma exécutées
- [ ] Application testée en production
- [ ] Emails fonctionnent
- [ ] Notifications push fonctionnent

---

## 🎉 Félicitations !

Votre application Secret Santa est maintenant en ligne sur Vercel !

