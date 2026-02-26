import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RiotMatchDto, SubjectStats } from './interfaces/match.interface';

@Injectable()
export class RiotService {
  private readonly logger = new Logger(RiotService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly puuid: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const region = this.configService.getOrThrow<string>('RIOT_REGION');
    this.baseUrl = `https://${region}.api.riotgames.com`;
    this.apiKey = this.configService.getOrThrow<string>('RIOT_API_KEY');
    this.puuid = this.configService.getOrThrow<string>('MY_PUUID');
  }

  async getLatestMatchId(): Promise<string | null> {
    try {
      const url = `${this.baseUrl}/lol/match/v5/matches/by-puuid/${this.puuid}/ids?count=1`;
      const response = await firstValueFrom(
        this.httpService.get<string[]>(url, {
          headers: { 'X-Riot-Token': this.apiKey },
        }),
      );

      if (response.data && response.data.length > 0) {
        return response.data[0];
      }
      return null;
    } catch (error) {
      this.logger.error('Failed to fetch latest match ID', error.message);
      return null;
    }
  }

  async getMatchDetails(matchId: string): Promise<RiotMatchDto | null> {
    try {
      const url = `${this.baseUrl}/lol/match/v5/matches/${matchId}`;
      const response = await firstValueFrom(
        this.httpService.get<RiotMatchDto>(url, {
          headers: { 'X-Riot-Token': this.apiKey },
        }),
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch match details for ${matchId}`,
        error.message,
      );
      return null;
    }
  }

  extractSubjectStats(match: RiotMatchDto): SubjectStats | null {
    const participant = match.info.participants.find(
      (p) => p.puuid === this.puuid,
    );

    if (!participant) {
      this.logger.error('Subject not found in match participants');
      return null;
    }

    return {
      matchId: match.metadata.matchId,
      championName: participant.championName,
      kills: participant.kills,
      deaths: participant.deaths,
      assists: participant.assists,
      win: participant.win,
      totalDamage: participant.totalDamageDealtToChampions,
      goldEarned: participant.goldEarned,
      visionScore: participant.visionScore,
      summonerName: participant.summonerName,
      gameDuration: match.info.gameDuration,
    };
  }
}
