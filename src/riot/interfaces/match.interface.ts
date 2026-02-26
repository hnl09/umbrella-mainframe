export interface RiotMatchDto {
  metadata: {
    matchId: string;
    participants: string[];
  };
  info: {
    gameCreation: number;
    gameDuration: number;
    gameMode: string;
    participants: RiotParticipant[];
  };
}

export interface RiotParticipant {
  puuid: string;
  championName: string;
  kills: number;
  deaths: number;
  assists: number;
  win: boolean;
  totalDamageDealtToChampions: number;
  goldEarned: number;
  visionScore: number;
  summonerName: string;
}

export interface SubjectStats {
  matchId: string;
  championName: string;
  kills: number;
  deaths: number;
  assists: number;
  win: boolean;
  totalDamage: number;
  goldEarned: number;
  visionScore: number;
  summonerName: string;
  gameDuration: number;
}
