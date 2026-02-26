import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Client,
  Events,
  GatewayIntentBits,
  EmbedBuilder,
  TextChannel,
} from 'discord.js';
import { SubjectStats } from '../riot/interfaces/match.interface';

@Injectable()
export class DiscordService implements OnModuleInit {
  private readonly logger = new Logger(DiscordService.name);
  private client: Client;
  private channelId: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds],
    });
    this.channelId = this.configService.getOrThrow<string>('CHANNEL_ID');
  }

  async onModuleInit() {
    const token = this.configService.getOrThrow<string>('DISCORD_TOKEN');

    this.client.on(Events.ClientReady, () => {
      this.logger.log('RED QUEEN ONLINE - All primary systems operational');
    });

    this.client.on('error', (error) => {
      this.logger.error('Discord client error', error.message);
    });

    await this.client.login(token);
  }

  private getBiohazardLevel(kda: number): string {
    if (kda >= 5) return 'CRITICAL (S-Tier)';
    if (kda >= 3) return 'HIGH (A-Tier)';
    if (kda >= 2) return 'MODERATE (B-Tier)';
    if (kda >= 1) return 'LOW (C-Tier)';
    return 'MINIMAL (D-Tier)';
  }

  private calculateKDA(kills: number, deaths: number, assists: number): number {
    return deaths === 0 ? kills + assists : (kills + assists) / deaths;
  }

  async sendCombatReport(stats: SubjectStats): Promise<void> {
    try {
      const channel: TextChannel = (await this.client.channels.fetch(
        this.channelId,
      )) as TextChannel;
      if (!channel) {
        this.logger.error('Target channel not found');
        return;
      }

      const kda = this.calculateKDA(stats.kills, stats.deaths, stats.assists);
      const kdaString = `${stats.kills}/${stats.deaths}/${stats.assists}`;
      const efficiencyRating = (stats.totalDamage / stats.goldEarned).toFixed(
        2,
      );
      const biohazardLevel = this.getBiohazardLevel(kda);
      const outcome = stats.win ? 'THREAT ELIMINATED' : 'ANOMALY ESCAPED';

      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('COMBAT EVALUATION')
        .setDescription(
          `Subject Performance Analysis Complete\n\n**${outcome}**`,
        )
        .addFields(
          { name: 'Subject Asset', value: stats.championName, inline: true },
          { name: 'KDA', value: kdaString, inline: true },
          { name: 'Biohazard Level', value: biohazardLevel, inline: true },
          {
            name: 'Efficiency Rating',
            value: `${efficiencyRating} DMG/Gold`,
            inline: true,
          },
          {
            name: 'Vision Score',
            value: stats.visionScore.toString(),
            inline: true,
          },
          {
            name: 'Total Damage',
            value: stats.totalDamage.toLocaleString(),
            inline: true,
          },
        )
        .setFooter({ text: '"You\'re all going to die down here."' })
        .setTimestamp();

      await channel.send({ embeds: [embed] });
      this.logger.log(`Combat report transmitted for match ${stats.matchId}`);
    } catch (error) {
      this.logger.error('Failed to send combat report', error.message);
    }
  }
}
