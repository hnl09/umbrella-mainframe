import { Entity, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Match {
  @PrimaryColumn()
  matchId: string;

  @CreateDateColumn()
  createdAt: Date;
}
