import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './entities/match.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'red-queen.db',
      entities: [Match],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Match]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
