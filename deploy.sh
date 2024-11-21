#!/bin/bash

# Récupérez les dernières modifications
git pull origin main

# Installez les dépendances
npm install

# Compilez l'application
npm run build

# Redémarrez l'application avec PM2
pm2 restart dist/index.js

echo "Déploiement terminé avec succès!"
