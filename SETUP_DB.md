# Configuration de la base de données

## ⭐ Option 1 : Supabase (Recommandé - Gratuit et Simple)

Supabase est compatible PostgreSQL et fonctionne avec votre code existant sans modification !

### Étapes

1. **Créer un compte** : https://supabase.com
2. **Créer un nouveau projet**
3. **Récupérer la connection string** :
   - Settings > Database > Connection string
   - Sélectionnez "URI" et copiez
4. **Mettre à jour `.env`** :
   ```
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
   ```
5. **Lancer les migrations** :
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

✅ **Avantages** : Gratuit, interface graphique, compatible Prisma, aucune modification de code

---

## Option 2 : PostgreSQL local

### 1. Installer PostgreSQL (si pas déjà installé)

Téléchargez PostgreSQL depuis : https://www.postgresql.org/download/windows/

Ou utilisez un gestionnaire de paquets :
```bash
# Avec Chocolatey
choco install postgresql

# Avec Scoop
scoop install postgresql
```

### 2. Démarrer PostgreSQL

Assurez-vous que le service PostgreSQL est démarré :
```powershell
# Vérifier le statut
Get-Service postgresql*

# Démarrer si nécessaire
Start-Service postgresql-x64-XX  # Remplacez XX par votre version
```

### 3. Créer la base de données

Connectez-vous à PostgreSQL :
```bash
psql -U postgres
```

Puis créez la base de données :
```sql
CREATE DATABASE santasecret;
CREATE USER santasecret_user WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE santasecret TO santasecret_user;
\q
```

### 4. Mettre à jour le fichier .env

Modifiez `DATABASE_URL` dans `.env` :
```
DATABASE_URL="postgresql://santasecret_user:votre_mot_de_passe@localhost:5432/santasecret?schema=public"
```

## Option 3 : Autres services cloud

### Railway (gratuit avec crédits)

1. Créez un compte sur https://railway.app
2. Créez un nouveau projet PostgreSQL
3. Copiez la connection string
4. Mettez à jour `DATABASE_URL` dans `.env`

### Autres services

- Neon (https://neon.tech)
- PlanetScale (https://planetscale.com)
- Heroku Postgres

## Une fois la base configurée

Lancez les migrations :
```bash
npx prisma migrate dev --name init
```

Puis chargez les données initiales :
```bash
npx prisma db seed
```

## Vérification

Pour vérifier que tout fonctionne :
```bash
npx prisma studio
```

Cela ouvrira une interface graphique pour visualiser vos données.

