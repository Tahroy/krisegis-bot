# krisegis-bot

Bot Discord JS Français en commandes Slash avec gestion de base de données SQLite
- Musiques (WIP)
- Anniversaires
- Mini-jeux (larves, memory, mastermind)
- Commandes d'administration (delete/kick)
- Génération de scénarios JdR (WIP)

## Jeux

### Potions
Jeu de mastermind

Utilisation des boutons Discord + Embed.

### Larve
Course de larves (résultat aléatoire)

Édition en direct d'une course de larves

### Memory
Jeu de mémoire, actuellement en commandes Slash. Sera édité via des boutons

## Gestion de la musique

Provoque depuis peu des exceptions. Retrait temporaire de la fonction le temps de l'analyse

### Gestion des anniversaires

En renseignant la date d'anniversaire avec la commande `/anniversaire ajouter`, le bot ajoute un CRON qui va souhaiter l'anniversaire sur le serveur à 10h le jour J
