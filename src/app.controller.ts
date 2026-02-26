import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { MatchTrackerService } from './match-tracker/match-tracker.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly matchTrackerService: MatchTrackerService,
  ) {}

  @Get()
  getStatus() {
    return {
      system: 'RED QUEEN',
      status: 'ONLINE',
      directive: 'Monitor subject combat performance',
      message: 'You are all going to die down here.',
    };
  }

  @Post('scan')
  async triggerScan() {
    const result = await this.matchTrackerService.scanForNewMatch();
    return {
      system: 'RED QUEEN',
      action: 'MANUAL_SCAN',
      result: result.found ? 'NEW_MATCH_DETECTED' : 'NO_NEW_DATA',
      matchId: result.matchId || null,
    };
  }
}
