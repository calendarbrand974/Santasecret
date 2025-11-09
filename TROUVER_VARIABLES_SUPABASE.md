# 🔑 Où trouver les variables Supabase pour l'upload d'images

## 📍 Étape 1 : Accéder aux paramètres API

1. Allez sur **https://supabase.com**
2. Connectez-vous à votre compte
3. Sélectionnez votre projet **"Santasecret"** (ou le nom de votre projet)
4. Dans le menu de gauche, cliquez sur **"Settings"** (⚙️)
5. Cliquez sur **"API"** dans le sous-menu

## 🔍 Étape 2 : Récupérer NEXT_PUBLIC_SUPABASE_URL

Sur la page **Settings > API**, vous verrez plusieurs sections :

### Section "Project URL"

Vous verrez quelque chose comme :
```
https://wtlvjemlkejcifclafjn.supabase.co
```

**C'est votre `NEXT_PUBLIC_SUPABASE_URL` !**

Copiez cette URL complète (avec `https://`).

## 🔐 Étape 3 : Récupérer SUPABASE_SERVICE_ROLE_KEY

Toujours sur la page **Settings > API**, cherchez la section :

### Section "Project API keys"

Vous verrez plusieurs clés :
- `anon` `public` - Clé publique (ne pas utiliser pour l'upload)
- `service_role` `secret` - **C'est celle-ci qu'il faut !**

⚠️ **ATTENTION** : La clé `service_role` est **SECRÈTE** et ne doit **JAMAIS** être exposée côté client !

1. Cliquez sur l'icône **👁️ (eye)** ou **"Reveal"** à côté de `service_role`
2. Copiez la clé complète (elle commence généralement par `eyJ...`)

**C'est votre `SUPABASE_SERVICE_ROLE_KEY` !**

## 📝 Résumé des valeurs

| Variable | Où la trouver | Exemple |
|----------|--------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Settings > API > **Project URL** | `https://wtlvjemlkejcifclafjn.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings > API > **Project API keys** > `service_role` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

## ✅ Étape 4 : Ajouter sur Vercel

1. Allez sur **https://vercel.com**
2. Sélectionnez votre projet **"Santasecret"**
3. **Settings** > **Environment Variables**
4. Cliquez sur **"Add New"**

### Ajouter NEXT_PUBLIC_SUPABASE_URL

- **Name** : `NEXT_PUBLIC_SUPABASE_URL`
- **Value** : `https://wtlvjemlkejcifclafjn.supabase.co` (votre URL)
- **Environments** : Cochez les 3 (Production, Preview, Development)
- Cliquez sur **"Save"**

### Ajouter SUPABASE_SERVICE_ROLE_KEY

- **Name** : `SUPABASE_SERVICE_ROLE_KEY`
- **Value** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (votre clé complète)
- **Environments** : Cochez les 3 (Production, Preview, Development)
- Cliquez sur **"Save"**

## 🔒 Sécurité

⚠️ **IMPORTANT** :
- `SUPABASE_SERVICE_ROLE_KEY` est **SECRÈTE** - ne la partagez jamais publiquement
- Ne la commitez **JAMAIS** dans Git
- Elle est déjà sécurisée dans Vercel (variables d'environnement)
- Elle ne sera jamais exposée côté client (utilisée uniquement côté serveur)

## ✅ Vérification

Après avoir ajouté les variables :
1. **Redéployez** votre projet sur Vercel
2. Testez l'upload d'une image dans la wishlist
3. Si ça fonctionne, l'image sera stockée dans Supabase Storage
4. Si ça ne fonctionne pas, vérifiez les logs Vercel pour voir les erreurs

## 🎯 Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL` récupérée depuis Supabase > Settings > API > Project URL
- [ ] `SUPABASE_SERVICE_ROLE_KEY` récupérée depuis Supabase > Settings > API > service_role
- [ ] Les 2 variables ajoutées sur Vercel > Settings > Environment Variables
- [ ] Les 3 environnements cochés (Production, Preview, Development)
- [ ] Projet redéployé sur Vercel
- [ ] Bucket `wishlist-images` créé sur Supabase Storage (public)

