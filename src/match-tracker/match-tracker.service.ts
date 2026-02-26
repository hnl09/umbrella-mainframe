import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from '../database/entities/match.entity';
import { RiotService } from '../riot/riot.service';
import { DiscordService } from '../discord/discord.service';

@Injectable()
export class MatchTrackerService {
  private readonly logger = new Logger(MatchTrackerService.name);
  private isProcessing = false;

  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    private readonly riotService: RiotService,
    private readonly discordService: DiscordService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async pollForNewMatches(): Promise<void> {
    if (this.isProcessing) {
      this.logger.debug('Previous scan still in progress, skipping...');
      return;
    }

    this.isProcessing = true;
    this.logger.debug('Initiating biometric scan...');

    try {
      await this.scanForNewMatch();
    } finally {
      this.isProcessing = false;
    }
  }

  async scanForNewMatch(): Promise<{ found: boolean; matchId?: string }> {
    const latestMatchId = await this.riotService.getLatestMatchId();

    if (!latestMatchId) {
      this.logger.debug('No match data retrieved from Riot API');
      return { found: false };
    }

    const existingMatch = await this.matchRepository.findOne({
      where: { matchId: latestMatchId },
    });

    if (existingMatch) {
      this.logger.debug(`Match ${latestMatchId} already logged`);
      return { found: false };
    }

    this.logger.log(`New combat data detected: ${latestMatchId}`);

    const matchDetails = await this.riotService.getMatchDetails(latestMatchId);
    if (!matchDetails) {
      this.logger.error('Failed to retrieve match details');
      return { found: false };
    }

    const stats = this.riotService.extractSubjectStats(matchDetails);
    if (!stats) {
      this.logger.error('Failed to extract subject statistics');
      return { found: false };
    }

    await this.matchRepository.save({ matchId: latestMatchId });
    this.logger.log(`Match ${latestMatchId} logged to database`);

    await this.discordService.sendCombatReport(stats);

    return { found: true, matchId: latestMatchId };
  }
}
