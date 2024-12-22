import {Client, Collection, GatewayIntentBits, Partials} from "discord.js";
import AbstractCommand from "../utils/AbstractCommand";
import Command from "./OldCommand";


class KrisegisClient extends Client {
    public commands: Collection<string, Command>;
    public typedCommands: Collection<string, AbstractCommand>;

    constructor() {
        super({
            intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildScheduledEvents, GatewayIntentBits.DirectMessages],
            partials: [Partials.Channel, Partials.User]
        });
        this.commands = new Collection();
        this.typedCommands = new Collection();
    }
}

export default KrisegisClient;