# 🔧 Configuration DATABASE_URL pour Vercel

## ✅ Valeur exacte à copier-coller

Copiez cette valeur **EXACTEMENT** dans la variable `DATABASE_URL` sur Vercel :

```
postgresql://postgres:MyNabstirith974%40@db.wtlvjemlkejcifclafjn.supabase.co:5432/postgres
```

## 📝 Instructions étape par étape

1. **Allez sur Vercel** : https://vercel.com
2. **Sélectionnez votre projet** "Santasecret"
3. **Allez dans Settings** > **Environment Variables**
4. **Trouvez ou créez la variable** `DATABASE_URL`
5. **Collez la valeur ci-dessus** dans le champ "Value"
6. **Cochez les 3 environnements** :
   - ✅ Production
   - ✅ Preview
   - ✅ Development
7. **Cliquez sur "Save"**
8. **Redéployez le projet**

## ⚠️ Points importants

- Le mot de passe `MyNabstirith974@` est encodé en `MyNabstirith974%40` (le `@` devient `%40`)
- Le port utilisé est `5432` (connexion directe)
- Ne pas ajouter de paramètres supplémentaires comme `?pgbouncer=true`

## 🔍 Vérification

Après le redéploiement, vérifiez les logs Vercel. Vous devriez voir :
```
🔌 Connecting to database: db.wtlvjemlkejcifclafjn.supabase.co:5432
```

Si vous voyez une erreur, vérifiez que :
- La variable `DATABASE_URL` est bien définie
- Les 3 environnements sont cochés
- Le projet a été redéployé après modification

