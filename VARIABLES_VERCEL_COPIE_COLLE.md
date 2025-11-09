# 📋 Variables Vercel - Prêtes à copier-coller

## Instructions
1. Dans Vercel, après avoir importé le projet
2. Cliquez sur "Environment Variables"
3. Pour chaque variable ci-dessous :
   - Cliquez sur "Add"
   - Copiez le **Name** et la **Value**
   - Cochez les 3 environnements (Production, Preview, Development)
   - Cliquez sur "Save"

---

## 1️⃣ DATABASE_URL

```
Name: DATABASE_URL
Value: (À copier depuis votre .env - ligne DATABASE_URL)
Environments: ✅ Production ✅ Preview ✅ Development
```

---

## 2️⃣ EMAIL_PROVIDER

```
Name: EMAIL_PROVIDER
Value: brevo
Environments: ✅ Production ✅ Preview ✅ Development
```

---

## 3️⃣ BREVO_API_KEY

```
Name: BREVO_API_KEY
Value: (À copier depuis votre .env - ligne BREVO_API_KEY)
Environments: ✅ Production ✅ Preview ✅ Development
```

---

## 4️⃣ BREVO_SENDER_EMAIL

```
Name: BREVO_SENDER_EMAIL
Value: (À copier depuis votre .env - ligne BREVO_SENDER_EMAIL)
Environments: ✅ Production ✅ Preview ✅ Development
```

---

## 5️⃣ BREVO_SENDER_NAME

```
Name: BREVO_SENDER_NAME
Value: Secret Santa
Environments: ✅ Production ✅ Preview ✅ Development
```

---

## 6️⃣ VAPID_PUBLIC_KEY

```
Name: VAPID_PUBLIC_KEY
Value: (À copier depuis votre .env - ligne VAPID_PUBLIC_KEY)
Environments: ✅ Production ✅ Preview ✅ Development
```

---

## 7️⃣ VAPID_PRIVATE_KEY

```
Name: VAPID_PRIVATE_KEY
Value: (À copier depuis votre .env - ligne VAPID_PRIVATE_KEY)
Environments: ✅ Production ✅ Preview ✅ Development
```

---

## 8️⃣ VAPID_SUBJECT

```
Name: VAPID_SUBJECT
Value: (À copier depuis votre .env - ligne VAPID_SUBJECT)
Environments: ✅ Production ✅ Preview ✅ Development
```

---

## 9️⃣ NEXT_PUBLIC_BASE_URL

```
Name: NEXT_PUBLIC_BASE_URL
Value: https://santasecret.vercel.app
Environments: ✅ Production ✅ Preview ✅ Development
```

⚠️ **Note** : Remplacez `santasecret` par le nom réel de votre projet Vercel après le premier déploiement, puis redéployez.

---

## 🔟 SESSION_SECRET

```
Name: SESSION_SECRET
Value: (À copier depuis votre .env - ligne SESSION_SECRET)
Environments: ✅ Production ✅ Preview ✅ Development
```

Si vous n'avez pas SESSION_SECRET dans votre .env, générez-le :
- Allez sur https://generate-secret.vercel.app/32
- Copiez le secret généré
- Utilisez-le comme valeur

---

## ✅ Checklist

- [ ] DATABASE_URL ajoutée
- [ ] EMAIL_PROVIDER = brevo ajoutée
- [ ] BREVO_API_KEY ajoutée
- [ ] BREVO_SENDER_EMAIL ajoutée
- [ ] BREVO_SENDER_NAME ajoutée
- [ ] VAPID_PUBLIC_KEY ajoutée
- [ ] VAPID_PRIVATE_KEY ajoutée
- [ ] VAPID_SUBJECT ajoutée
- [ ] NEXT_PUBLIC_BASE_URL ajoutée
- [ ] SESSION_SECRET ajoutée

Une fois toutes les variables ajoutées, vous pouvez cliquer sur "Deploy" !

