export class CommandCooldownError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CommandCooldownError'; // Identifie l'erreur
    }
}
