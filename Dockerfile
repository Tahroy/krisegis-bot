# Utilisez l'image officielle Node.js en version 16 ou plus récente
FROM node:18

# Créez et changez de répertoire de travail
WORKDIR /app

# Copiez package.json et package-lock.json
COPY package*.json ./

# Installez les dépendances
RUN npm install

# Copiez le reste des fichiers de l'application
COPY . .

# Compilez le TypeScript
RUN npm run build

# Exposez le port que votre application utilise
EXPOSE 3000

# Démarrez l'application
CMD ["npm", "start"]