# 📷 Configuration de l'upload d'images depuis mobile

## ✅ Fonctionnalité ajoutée

Les utilisateurs peuvent maintenant :
- 📸 **Prendre une photo** directement depuis leur téléphone
- 🖼️ **Choisir une image** depuis leur galerie
- 🔗 **Ou entrer une URL** d'image (comme avant)

## 🔧 Configuration requise

### Option 1 : Supabase Storage (Recommandé)

#### 1. Créer un bucket sur Supabase

1. Allez sur https://supabase.com
2. Sélectionnez votre projet
3. Allez dans **Storage** (dans le menu de gauche)
4. Cliquez sur **"New bucket"**
5. Nom du bucket : `wishlist-images`
6. **Public bucket** : ✅ Cochez cette option (pour que les images soient accessibles publiquement)
7. Cliquez sur **"Create bucket"**

#### 2. Configurer les politiques de sécurité (optionnel mais recommandé)

1. Dans **Storage** > **Policies**
2. Créez une politique pour permettre l'upload :
   - **Policy name** : `Allow authenticated uploads`
   - **Allowed operation** : `INSERT`
   - **Policy definition** : `auth.role() = 'authenticated'`

#### 3. Ajouter les variables d'environnement sur Vercel

1. Allez sur https://vercel.com
2. Sélectionnez votre projet
3. **Settings** > **Environment Variables**
4. Ajoutez ces variables :

```
NEXT_PUBLIC_SUPABASE_URL=https://[votre-project-ref].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[votre-service-role-key]
```

**Où trouver ces valeurs :**
- `NEXT_PUBLIC_SUPABASE_URL` : Dans Supabase > Settings > API > Project URL
- `SUPABASE_SERVICE_ROLE_KEY` : Dans Supabase > Settings > API > service_role key (⚠️ **SECRET**, ne le partagez jamais publiquement)

5. **Cochez les 3 environnements** : Production, Preview, Development
6. Cliquez sur **"Save"**
7. **Redéployez** le projet

### Option 2 : Stockage temporaire (Base64)

Si Supabase Storage n'est pas configuré, l'application utilisera automatiquement un stockage temporaire en base64. **Note** : Ce n'est pas recommandé pour la production car :
- Les images sont stockées dans la base de données (peut devenir volumineux)
- Performance réduite
- Limite de taille

## 📱 Utilisation

### Pour les utilisateurs

1. Ouvrez votre **Wishlist**
2. Cliquez sur **"Ajouter un article"** ou **"Modifier"** un article existant
3. Dans le formulaire, vous verrez :
   - Un bouton **"📷 Prendre une photo / Choisir une image"**
   - Un champ **"URL image"** (si vous préférez entrer une URL)
4. Cliquez sur le bouton pour :
   - **Prendre une photo** (sur mobile, ouvre l'appareil photo)
   - **Choisir une image** depuis votre galerie
5. L'image sera automatiquement uploadée et ajoutée à votre article

### Fonctionnalités

- ✅ Support mobile (caméra + galerie)
- ✅ Support desktop (sélection de fichier)
- ✅ Prévisualisation de l'image
- ✅ Suppression de l'image (bouton ✕)
- ✅ Validation du type de fichier (images uniquement)
- ✅ Limite de taille (5 MB max)
- ✅ Compatible avec les URLs d'images existantes

## 🔍 Dépannage

### L'upload ne fonctionne pas

1. Vérifiez que Supabase Storage est configuré
2. Vérifiez que les variables d'environnement sont définies sur Vercel
3. Vérifiez que le bucket `wishlist-images` existe et est public
4. Consultez les logs Vercel pour voir les erreurs

### Les images ne s'affichent pas

1. Vérifiez que le bucket est **public**
2. Vérifiez que l'URL de l'image est correcte
3. Vérifiez les permissions CORS si nécessaire

## 📝 Notes techniques

- **Taille max** : 5 MB par image
- **Formats supportés** : JPEG, PNG, WebP, GIF
- **Stockage** : Supabase Storage (recommandé) ou base64 (fallback)
- **Sécurité** : Seuls les utilisateurs authentifiés peuvent uploader

