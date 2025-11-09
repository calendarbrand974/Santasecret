# 📋 Variables d'environnement pour Vercel

Copiez-collez ces variables dans Vercel (Settings > Environment Variables)

## 🔐 Base de données

```
Name: DATABASE_URL
Value: (copiez depuis votre .env local)
Environments: ✅ Production ✅ Preview ✅ Development
```

## 📧 Emails

```
Name: EMAIL_PROVIDER
Value: brevo
Environments: ✅ Production ✅ Preview ✅ Development
```

```
Name: BREVO_API_KEY
Value: (copiez depuis votre .env local)
Environments: ✅ Production ✅ Preview ✅ Development
```

```
Name: BREVO_SENDER_EMAIL
Value: (copiez depuis votre .env local)
Environments: ✅ Production ✅ Preview ✅ Development
```

```
Name: BREVO_SENDER_NAME
Value: Secret Santa
Environments: ✅ Production ✅ Preview ✅ Development
```

## 🔔 Notifications Push

```
Name: VAPID_PUBLIC_KEY
Value: (copiez depuis votre .env local)
Environments: ✅ Production ✅ Preview ✅ Development
```

```
Name: VAPID_PRIVATE_KEY
Value: (copiez depuis votre .env local)
Environments: ✅ Production ✅ Preview ✅ Development
```

```
Name: VAPID_SUBJECT
Value: (copiez depuis votre .env local, ex: mailto:admin@example.com)
Environments: ✅ Production ✅ Preview ✅ Development
```

## 🌐 URL (à mettre à jour après le déploiement)

```
Name: NEXT_PUBLIC_BASE_URL
Value: https://santasecret.vercel.app
Environments: ✅ Production ✅ Preview ✅ Development
```

⚠️ **Note** : Remplacez `santasecret` par le nom réel de votre projet Vercel après le premier déploiement.

## 🔐 Session

```
Name: SESSION_SECRET
Value: (copiez depuis votre .env local)
Environments: ✅ Production ✅ Preview ✅ Development
```

---

## 📝 Instructions

1. Dans Vercel, après avoir cliqué sur "Import" pour votre projet
2. **AVANT** de cliquer sur "Deploy", cliquez sur "Environment Variables"
3. Ajoutez chaque variable une par une en copiant depuis votre `.env` local
4. Cochez les 3 environnements (Production, Preview, Development) pour chaque variable
5. Une fois toutes les variables ajoutées, cliquez sur "Deploy"

