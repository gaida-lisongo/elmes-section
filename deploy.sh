#!/bin/bash

# Arrêter le script si une commande échoue
set -e

# Aller dans le dossier du projet
#cd /var/www/mon-projet || exit

echo "🚀 Début du déploiement à $(date)"

# Remettre l'état propre et récupérer la dernière version
git reset --hard
git pull origin main

# Installer les dépendances (sans recompiler inutilement)
npm install --production

# Si tu as un build (React, Vue, Next.js, etc.), ajoute :
# npm run build

# Redémarrer ton application avec PM2
pm2 restart elmes-api || pm2 start index.js --name "elmes-api"

echo "✅ Déploiement terminé à $(date)"

