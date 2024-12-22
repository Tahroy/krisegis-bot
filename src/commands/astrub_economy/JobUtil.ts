class JobUtil {
    static getLevelFromXP(currentXP: number, baseXP: number = 10): number {
        // Initialisation des variables
        let level = 0;
        let xpForNextLevel = baseXP;

        // Boucle pour trouver le niveau en fonction de l'XP actuelle
        while (currentXP >= xpForNextLevel) {
            currentXP -= xpForNextLevel; // On retire l'XP requise pour le niveau actuel
            level++; // Augmente le niveau
            xpForNextLevel = baseXP * (level + 1) ** 2; // Calcule l'XP requise pour le prochain niveau
        }

        return level;
    }

    static isLessThanXMinutesAgo(date: Date, minutes: number): boolean {
        return (Date.now() - date.getTime()) < minutes * 60 * 1000;
    }
}

export default JobUtil;