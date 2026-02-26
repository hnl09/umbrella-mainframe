import { Module } from '@nestjs/common';
import { MatchTrackerService } from './match-tracker.service';
import { RiotModule } from '../riot/riot.module';
import { DiscordModule } from '../discord/discord.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule, RiotModule, DiscordModule],
  providers: [MatchTrackerService],
  exports: [MatchTrackerService],
})
export class MatchTrackerModule {}
