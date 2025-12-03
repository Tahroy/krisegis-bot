import {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle, Channel,
    EmbedBuilder,
    Guild,
    MessageFlags,
    TextChannel
} from 'discord.js';
import Variable from "../models/Variable";
import Monster from "../models/Monster";
import SmashPassRound from "../models/SmashPassRound";
import SmashPassVote, {SmashPassChoice} from "../models/SmashPassVote";
import Npc from "../models/Npc";

export default class SmashPassService {
    static async getRandomMonster(guildId: string): Promise<Monster | null> {
        const rounds = await SmashPassRound.findAll({ where: { guildId, subjectType: 'monster' } });
        const usedIds = new Set(rounds.map(r => r.monsterId!).filter(Boolean));

        const all = await Monster.findAll();
        if (all.length === 0) {
            return null;
        }

        const notUsed = all.filter(m => !usedIds.has(m.id));
        const pool = notUsed.length > 0 ? notUsed : all;
        const pick = pool[Math.floor(Math.random() * pool.length)];
        return pick ?? null;
    }

    static async getRandomNpc(guildId: string): Promise<Npc | null> {
        const rounds = await SmashPassRound.findAll({ where: { guildId, subjectType: 'npc' } });
        const usedIds = new Set(rounds.map(r => r.npcId!).filter(Boolean));

        const all = await Npc.findAll();
        if (all.length === 0) {
            return null;
        }

        const notUsed = all.filter(n => !usedIds.has(n.id));
        const pool = notUsed.length > 0 ? notUsed : all;
        const pick = pool[Math.floor(Math.random() * pool.length)];
        return pick ?? null;
    }

    /**
     * Annonce le résultat du dernier round
     */
    static async announceLastResult(guild: Guild, channel: TextChannel, type: 'monster' | 'npc') {
        try {
            const lastRound = await SmashPassRound.findOne({
                where: { guildId: guild.id,  subjectType: type},
                order: [['createdAt', 'DESC']],
            });
            if (!lastRound) {
                return;
            }

            const [smashCount, passCount] = await Promise.all([
                SmashPassVote.count({ where: { roundId: lastRound.id, choice: 'smash' } }),
                SmashPassVote.count({ where: { roundId: lastRound.id, choice: 'pass' } }),
            ]);

            let name: string;
            if (lastRound.subjectType === 'monster' && lastRound.monsterId) {
                const prevMonster = await Monster.findByPk(lastRound.monsterId);
                name = prevMonster?.name ?? '';
            } else if (lastRound.subjectType === 'npc' && lastRound.npcId) {
                const prevNpc = await Npc.findByPk(lastRound.npcId);
                name = prevNpc?.name ?? '';
            } else {
                name = 'Sujet inconnu';
            }

            let text: string;
            const total = smashCount + passCount;
            if (total === 0) {
                text = `Résultat du dernier round : Aucun vote pour ${name}.`;
            } else if (smashCount > passCount) {
                text = `Résultat du dernier round : Smash l'emporte pour ${name} (Smash ${smashCount} / Pass ${passCount}).`;
            } else if (passCount > smashCount) {
                text = `Résultat du dernier round : Pass l'emporte pour ${name} (Smash ${smashCount} / Pass ${passCount}).`;
            } else {
                text = `Résultat du dernier round : Égalité pour ${name} (Smash ${smashCount} / Pass ${passCount}).`;
            }

            await channel.send({ content: text });
        } catch (e) {
            console.error('Erreur lors de la récupération du dernier résultat Smash or Pass : ', e);
        }
    }

    /**
     * Présente le nouveau smash or pass du jour
     */
    static async presentNewRound(guild: Guild, channel: TextChannel, type : 'monster' | 'npc') {
        let title: string;
        let attachment: AttachmentBuilder | null = null;
        let embedImage: string | null = null;
        let roundData: Partial<{ subjectType: 'monster' | 'npc'; monsterId: number | null; npcId: number | null; } & { guildId: string; channelId: string; messageId: string | null } > = {
            guildId: guild.id,
            channelId: channel.id,
            messageId: null
        };

        if (type === 'npc') {
            const npc = await this.getRandomNpc(guild.id);
            if (!npc) return;
            const imagePath = await npc.getImage();
            attachment = new AttachmentBuilder(imagePath, { name: `${npc.id}.png` });
            embedImage = `attachment://${npc.id}.png`;
            title = `Smash or Pass : ${npc.name}`;
            roundData.subjectType = 'npc';
            roundData.npcId = npc.id;
            roundData.monsterId = null;
        } else {
            const monster = await this.getRandomMonster(guild.id);
            if (!monster) {
                return;
            }
            const imagePath = await monster.getImage();
            attachment = new AttachmentBuilder(imagePath, { name: `${monster.id}.png` });
            embedImage = `attachment://${monster.id}.png`;
            title = `Smash or Pass : ${monster.name}`;
            roundData.subjectType = 'monster';
            roundData.monsterId = monster.id;
            roundData.npcId = null;
        }

        const round = await SmashPassRound.create(roundData as any);

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription("Votez en cliquant sur un bouton ci-dessous !")
            .setImage(embedImage!);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`smashpass-smash|${round.id}`)
                .setStyle(ButtonStyle.Success)
                .setLabel('Smash (0)'),
            new ButtonBuilder()
                .setCustomId(`smashpass-pass|${round.id}`)
                .setStyle(ButtonStyle.Danger)
                .setLabel('Pass (0)')
        );

        const message = await channel.send({ embeds: [embed], components: [row], files: attachment ? [attachment] : [] });
        await round.update({ messageId: message.id });
    }

    static async postDaily(guild: Guild, type: 'monster' | 'npc') {
        let channelVar = await Variable.findOne({ where: { name: 'channel_smash_or_pass', server: guild.id } });

        if (!channelVar) {
            console.log(`Pas de canal smash or pass pour ${guild.id}`);
            return;
        }
        const channel = await guild.channels.fetch(channelVar.data);
        if (!channel || !channel.isSendable()) {
            console.log(`Impossible d'écrire dans le canal smash or pass pour ${guild.id}`);
            return;
        }

        await this.announceLastResult(guild, channel as TextChannel, type);
        await this.presentNewRound(guild, channel as TextChannel, type);
    }

    static async handleButton(interaction: ButtonInteraction) {
        const [action, roundIdStr] = interaction.customId.replace('smashpass-', '').split('|');
        const roundId = Number(roundIdStr);
        const choice = (action === 'smash' ? 'smash' : 'pass') as SmashPassChoice;

        const round = await SmashPassRound.findByPk(roundId);
        if (!round) {
            await interaction.reply({ content: 'Smash or Pass introuvable ou expiré.', flags: MessageFlags.Ephemeral });
            return;
        }

        // Bloque le vote si le round a plus de 24h
        const twentyFourHours = 24 * 60 * 60 * 1000;
        const created = round.createdAt;
        if ((Date.now() - new Date(created).getTime()) > twentyFourHours) {
            await interaction.reply({ content: 'Ce Smash or Pass est fermé (plus de 24h).', flags: MessageFlags.Ephemeral });
            return;
        }

        // On enregistre ou on met à jour le vote
        const existing = await SmashPassVote.findOne({ where: { roundId: round.id, userId: interaction.user.id } });
        if (!existing) {
            await SmashPassVote.create({ roundId: round.id, userId: interaction.user.id, choice });
        } else if (existing.choice !== choice) {
            existing.choice = choice;
            await existing.save();
        }

        const smashCount = await SmashPassVote.count({ where: { roundId: round.id, choice: 'smash' } });
        const passCount = await SmashPassVote.count({ where: { roundId: round.id, choice: 'pass' } });

        // Editer les boutons
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`smashpass-smash|${round.id}`)
                .setStyle(ButtonStyle.Success)
                .setLabel(`Smash (${smashCount})`),
            new ButtonBuilder()
                .setCustomId(`smashpass-pass|${round.id}`)
                .setStyle(ButtonStyle.Danger)
                .setLabel(`Pass (${passCount})`)
        );

        try {
            await interaction.update({ components: [row] });
        } catch (e) {
            console.error(e);
        }
    }
}
