import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { RiotModule } from './riot/riot.module';
import { DiscordModule } from './discord/discord.module';
import { MatchTrackerModule } from './match-tracker/match-tracker.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    RiotModule,
    DiscordModule,
    MatchTrackerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
