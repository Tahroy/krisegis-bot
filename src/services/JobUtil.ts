import BaseItem from "../models/astrub_economy/BaseItem";
import {Client, Guild, User} from "discord.js";
import Player from "../models/astrub_economy/Player";
import KrisegisClient from "../models/KrisegisClient";
import BuildingGuild from "../models/astrub_economy/BuildingGuild";
import {Building, Buildings} from "../models/astrub_economy/Building";
import {LevelEnum} from "../models/astrub_economy/Enums";
import {Op} from "sequelize";

class JobUtil {

    static isLessThanXMinutesAgo(date: Date, minutes: number): boolean {
        return (Date.now() - date.getTime()) < minutes * 60 * 1000;
    }

    static getTimeBeforeNextHarvest(lastHarvest: Date, minutes: number): number {
        const nextHarvest = new Date(lastHarvest.getTime() + minutes * 60 * 1000);
        return Math.floor((nextHarvest.getTime() - Date.now()));
    }

    static async getPlayer(user: User, guildId: string): Promise<Player> {
        let player = await Player.findOne({
            where: {
                userId: user.id, guildId: guildId
            }
        })

        if (player) {
            return player;
        }

        return await Player.create({userId: user.id, guildId: guildId})
    }


    static async getEmoji(item: BaseItem, client: Client): Promise<string> {
        if (!item.emoji) {
            return '';
        }

        if (!client.application) {
            return '';
        }


        const clientApplicationEmojis = await client.application.emojis.fetch()

        const searchEmoji = clientApplicationEmojis.find(emoji => emoji.name === item.emoji)

        if (!searchEmoji) {
            return '';
        }
        return `<:${searchEmoji.name}:${searchEmoji.id}>`

    }

    static async getBuildingsGuild(guild: Guild | null): Promise<string[]> {
        if (!guild) {
            return []
        }

        const builds = await BuildingGuild.findAll({
            where: {status: "completed", guildId: guild.id}
        })

        const retour = [];

        for (const build of builds) {
            retour.push(build.name);
        }

        return retour;
    }

    static getBuilding(value: string) {
        return Object.values(Buildings).find(r => r.name === value) ?? null
    }

    static getEmptyRecipe(building: Building): Record<string, number> {
        const resetValues = (obj: Record<string, number>): Record<string, number> => {
            const newObj: Record<string, number> = {};
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    newObj[key] = 0;
                }
            }
            return newObj;
        };

        return resetValues(building.recipe)
    }

    static getChannel(client: KrisegisClient, guildId: any) {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            return;
        }
        return guild.channels.cache.find(channel => (channel.name === 'Astrub Économie') || (channel.name === 'astrub-economie'))
    }

    public static async isBuildingConstructed(guildId: string, buildingName: string): Promise<boolean> {
        const buildingGuild = await BuildingGuild.findOne({
            where: {
                guildId: guildId,
                name: buildingName,
                status: "completed"
            }
        });
        return buildingGuild !== null
    }

    /**
     * Retourne le nombre de joueurs actifs ces trois derniers jours
     */
    static async getNbActivesPlayers(guildId: string) {
        return await Player.count({
            where: {
                guildId: guildId,
                lastHarvest: {
                    [Op.gt]: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)
                }
            }
        });
    }

    static async getUsername(playerId: string, guild: Guild) {
        const member = await guild.members.fetch(playerId);
        return member.displayName;
    }

    static getExperienceByLevel(level: LevelEnum) {
        switch (level) {
            case LevelEnum.LEVEL_0:
                return 10;
            case LevelEnum.LEVEL_10:
                return 40;
            case LevelEnum.LEVEL_20:
                return 90;
        }
    }
}

export default JobUtil;
