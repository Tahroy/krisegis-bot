#!/bin/bash

cd /home/krisqadw/krisegis-bot || exit

# Effectuer un pull des dernières modifications depuis le repository Git
echo "Récupération des dernières modifications depuis Git..."
git pull || { echo "Git pull a échoué !"; exit 1; }

# Installer les dépendances via npm
#echo "Installation des dépendances..."
#sudo npm install || { echo "npm install a échoué !"; exit 1; }


npm run build || { echo "npm rund build a échoué !"; exit 1; }

# Arrêter et redémarrer pm2
echo "Redémarrage de pm2..."
pm2 restart dist/index.js || { echo "pm2 restart a échoué !"; exit 1; }

# Surveiller les logs de pm2
echo "Lancement de pm2 monit..."
pm2 monit || { echo "pm2 monit a échoué !"; exit 1; }

echo "Déploiement terminé avec succès !"
